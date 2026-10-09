package com.ligaprovincial.service;

import com.ligaprovincial.dto.MatchEventDTOs.*;
import com.ligaprovincial.model.entity.*;
import com.ligaprovincial.model.enums.CardType;
import com.ligaprovincial.model.enums.MatchStatus;
import com.ligaprovincial.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final ClubRepository clubRepository;
    private final GoalRepository goalRepository;
    private final CardRepository cardRepository;
    private final PenaltyRepository penaltyRepository;

    @Transactional(readOnly = true)
    public Match findById(UUID id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Partido con ID " + id + " no encontrado"));
    }

    /**
     * REGLA DE NEGOCIO: Validación Previa de Planilla de Alineación (Bloqueo de Alineación Indebida)
     */
    @Transactional(readOnly = true)
    public LineupValidationResponse validateLineup(UUID matchId, List<UUID> playerIds) {
        Match match = findById(matchId);

        if (match.getEstado() == MatchStatus.FINALIZADO) {
            throw new IllegalStateException("El partido ya ha finalizado y el acta es inmutable");
        }

        List<Player> players = playerRepository.findAllByIdIn(playerIds);
        if (players.size() != playerIds.size()) {
            throw new IllegalArgumentException("Uno o más jugadores no existen en el padrón oficial");
        }

        List<EligiblePlayerDTO> eligibleList = new ArrayList<>();

        for (Player p : players) {
            String fullName = p.getNombres() + " " + p.getApellidos();

            // 1. Pertenencia a clubes del partido
            boolean belongs = p.getClub().getId().equals(match.getClubLocal().getId()) ||
                              p.getClub().getId().equals(match.getClubVisita().getId());
            if (!belongs) {
                throw new AccessDeniedException("Alineación indebida: El jugador " + fullName + " pertenece a un club ajeno al encuentro");
            }

            // 2. Habilitación administrativa
            if (!Boolean.TRUE.equals(p.getHabilitado())) {
                throw new AccessDeniedException("Alineación rechazada: El jugador " + fullName + " no está habilitado administrativamente");
            }

            // 3. Apto médico vigente
            if (!Boolean.TRUE.equals(p.getEstadoMedico())) {
                throw new AccessDeniedException("Alineación rechazada: El jugador " + fullName + " no cuenta con apto médico vigente");
            }

            // 4. Sanciones disciplinarias activas
            boolean hasActivePenalty = p.getSanciones() != null &&
                    p.getSanciones().stream().anyMatch(s -> Boolean.TRUE.equals(s.getActiva()));
            if (hasActivePenalty) {
                throw new AccessDeniedException("Alineación rechazada: El jugador " + fullName + " tiene una sanción disciplinaria activa");
            }

            eligibleList.add(EligiblePlayerDTO.builder()
                    .id(p.getId())
                    .dni(p.getDni())
                    .nombreCompleto(fullName)
                    .club(p.getClub().getNombreCorto())
                    .numeroCamiseta(p.getNumeroCamiseta())
                    .build());
        }

        return LineupValidationResponse.builder()
                .valido(true)
                .partidoId(match.getId())
                .totalJugadores(eligibleList.size())
                .jugadoresHabilitados(eligibleList)
                .build();
    }

    /**
     * REGLA DE NEGOCIO: Registro Atómico de Gol con Regla de Inmutabilidad
     */
    @Transactional
    public Goal addGoal(UUID matchId, AddGoalRequest request) {
        Match match = findById(matchId);

        if (match.getEstado() == MatchStatus.FINALIZADO) {
            throw new IllegalStateException("El acta de este partido ya fue cerrada y es INMUTABLE");
        }

        Player player = playerRepository.findById(request.getJugadorId())
                .orElseThrow(() -> new EntityNotFoundException("Jugador no encontrado"));

        Club team = clubRepository.findById(request.getEquipoId())
                .orElseThrow(() -> new EntityNotFoundException("Equipo no encontrado"));

        Goal goal = Goal.builder()
                .partido(match)
                .jugador(player)
                .equipo(team)
                .minuto(request.getMinuto())
                .build();

        Goal savedGoal = goalRepository.save(goal);

        // Actualizar marcador
        if (team.getId().equals(match.getClubLocal().getId())) {
            match.setGolesLocal(match.getGolesLocal() + 1);
        } else {
            match.setGolesVisita(match.getGolesVisita() + 1);
        }
        match.setEstado(MatchStatus.EN_JUEGO);
        matchRepository.save(match);

        return savedGoal;
    }

    /**
     * REGLA DE NEGOCIO: Registro de Tarjetas y Control Automático de Sanciones Disciplinarias
     * 1. Doble amarilla en el mismo partido -> Expulsión + Sanción automática de 1 fecha.
     * 2. Roja directa -> Sanción automática de al menos 1 fecha.
     * 3. Amarilla acumulada -> Sanción automática al alcanzar N amarillas del torneo (ej. 3 o 5).
     */
    @Transactional
    public Card addCard(UUID matchId, AddCardRequest request) {
        Match match = findById(matchId);

        if (match.getEstado() == MatchStatus.FINALIZADO) {
            throw new IllegalStateException("El acta de este partido ya fue cerrada y es INMUTABLE");
        }

        Player player = playerRepository.findById(request.getJugadorId())
                .orElseThrow(() -> new EntityNotFoundException("Jugador no encontrado"));

        UUID tournamentId = match.getTorneo().getId();
        int maxAmarillas = match.getTorneo().getMaxAmarillasSuspension();

        if (request.getTipo() == CardType.AMARILLA) {
            // Verificar si ya tiene una amarilla en ESTE partido (Doble Amarilla)
            long yellowsInMatch = cardRepository.countByPartidoIdAndJugadorIdAndTipo(matchId, player.getId(), CardType.AMARILLA);

            if (yellowsInMatch >= 1) {
                // Doble Amarilla = Expulsión
                Card card = Card.builder()
                        .partido(match)
                        .jugador(player)
                        .tipo(CardType.AMARILLA)
                        .minuto(request.getMinuto())
                        .motivo("Segunda amonestación en el partido (Expulsión por doble amarilla)")
                        .build();

                Card savedCard = cardRepository.save(card);

                Penalty penalty = Penalty.builder()
                        .jugador(player)
                        .fechasSuspension(1)
                        .fechasCumplidas(0)
                        .motivo("Expulsión por doble tarjeta amarilla en partido (Min. " + request.getMinuto() + ")")
                        .activa(true)
                        .build();
                penaltyRepository.save(penalty);

                return savedCard;
            }

            // Primera amarilla en el partido
            Card card = Card.builder()
                    .partido(match)
                    .jugador(player)
                    .tipo(CardType.AMARILLA)
                    .minuto(request.getMinuto())
                    .motivo(request.getMotivo() != null ? request.getMotivo() : "Falta táctica / Amonestación")
                    .build();

            Card savedCard = cardRepository.save(card);

            // Contar total acumulado en el torneo
            long totalYellows = cardRepository.countByPartidoTorneoIdAndJugadorIdAndTipo(tournamentId, player.getId(), CardType.AMARILLA);

            if (totalYellows > 0 && totalYellows % maxAmarillas == 0) {
                Penalty penalty = Penalty.builder()
                        .jugador(player)
                        .fechasSuspension(1)
                        .fechasCumplidas(0)
                        .motivo("Suspensión automática por acumulación de " + totalYellows + " tarjetas amarillas (Ciclo de " + maxAmarillas + ")")
                        .activa(true)
                        .build();
                penaltyRepository.save(penalty);
            }

            return savedCard;
        }

        // Tarjeta Roja Directa
        Card card = Card.builder()
                .partido(match)
                .jugador(player)
                .tipo(CardType.ROJA)
                .minuto(request.getMinuto())
                .motivo(request.getMotivo() != null ? request.getMotivo() : "Expulsión con tarjeta roja directa")
                .build();

        Card savedCard = cardRepository.save(card);

        Penalty penalty = Penalty.builder()
                .jugador(player)
                .fechasSuspension(1)
                .fechasCumplidas(0)
                .motivo("Expulsión con tarjeta roja directa (Min. " + request.getMinuto() + ")")
                .activa(true)
                .build();
        penaltyRepository.save(penalty);

        return savedCard;
    }

    /**
     * REGLA DE NEGOCIO: Cierre y Sellado de Acta Arbitral (Inmutabilidad y Cumplimiento de Fechas)
     */
    @Transactional
    public Match closeMatch(UUID matchId) {
        Match match = findById(matchId);

        if (match.getEstado() == MatchStatus.FINALIZADO) {
            throw new IllegalStateException("El partido ya se encuentra en estado FINALIZADO");
        }

        // 1. Recalcular goles oficiales a partir de eventos registrados
        long golesLocal = goalRepository.countByPartidoIdAndEquipoId(matchId, match.getClubLocal().getId());
        long golesVisita = goalRepository.countByPartidoIdAndEquipoId(matchId, match.getClubVisita().getId());

        match.setGolesLocal((int) golesLocal);
        match.setGolesVisita((int) golesVisita);
        match.setEstado(MatchStatus.FINALIZADO);
        Match closedMatch = matchRepository.save(match);

        // 2. Cumplimiento de fechas de sanción para jugadores de ambos clubes que estaban suspendidos
        List<UUID> clubIds = List.of(match.getClubLocal().getId(), match.getClubVisita().getId());
        List<Penalty> activePenalties = penaltyRepository.findAllByActivaTrueAndJugadorClubIdIn(clubIds);

        for (Penalty p : activePenalties) {
            int cumplidas = p.getFechasCumplidas() + 1;
            p.setFechasCumplidas(cumplidas);
            if (cumplidas >= p.getFechasSuspension()) {
                p.setActiva(false);
            }
        }
        penaltyRepository.saveAll(activePenalties);

        return closedMatch;
    }
}
