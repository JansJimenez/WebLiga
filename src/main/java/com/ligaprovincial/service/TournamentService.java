package com.ligaprovincial.service;

import com.ligaprovincial.dto.TournamentDTO.*;
import com.ligaprovincial.model.entity.Club;
import com.ligaprovincial.model.entity.Match;
import com.ligaprovincial.model.entity.Tournament;
import com.ligaprovincial.model.enums.MatchStatus;
import com.ligaprovincial.repository.ClubRepository;
import com.ligaprovincial.repository.MatchRepository;
import com.ligaprovincial.repository.TournamentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final ClubRepository clubRepository;
    private final MatchRepository matchRepository;

    @Transactional(readOnly = true)
    public List<TournamentResponse> findAll() {
        return tournamentRepository.findAllByOrderByAnioDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TournamentResponse findById(UUID id) {
        Tournament t = tournamentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Torneo con ID " + id + " no encontrado"));
        return mapToResponse(t);
    }

    @Transactional
    public TournamentResponse create(CreateTournamentRequest request) {
        Tournament tournament = Tournament.builder()
                .nombre(request.getNombre().trim())
                .anio(request.getAnio())
                .formato(request.getFormato())
                .puntosVictoria(request.getPuntosVictoria() != null ? request.getPuntosVictoria() : 3)
                .puntosEmpate(request.getPuntosEmpate() != null ? request.getPuntosEmpate() : 1)
                .puntosDerrota(request.getPuntosDerrota() != null ? request.getPuntosDerrota() : 0)
                .maxAmarillasSuspension(request.getMaxAmarillasSuspension() != null ? request.getMaxAmarillasSuspension() : 3)
                .build();

        Tournament saved = tournamentRepository.save(tournament);
        return mapToResponse(saved);
    }

    /**
     * Algoritmo de Fixture Round-Robin (Sistema Berger oficial)
     * Genera automáticamente las jornadas con alternancia de localía y descanso (BYE).
     */
    @Transactional
    public List<Match> generateRoundRobinFixture(UUID tournamentId, List<UUID> clubIds, LocalDate startDate) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new EntityNotFoundException("Torneo no encontrado"));

        if (clubIds == null || clubIds.size() < 2) {
            throw new IllegalArgumentException("Se requieren al menos 2 clubes para generar el fixture");
        }

        Map<UUID, Club> clubMap = clubRepository.findByIdIn(clubIds).stream()
                .collect(Collectors.toMap(Club::getId, c -> c));

        List<UUID> teams = new ArrayList<>(clubIds);
        boolean isOdd = teams.size() % 2 != 0;
        UUID byeId = UUID.randomUUID(); // Ficticio para fecha libre

        if (isOdd) {
            teams.add(byeId);
        }

        int totalTeams = teams.size();
        int totalRounds = totalTeams - 1;
        int matchesPerRound = totalTeams / 2;

        LocalDate currentDate = (startDate != null) ? startDate : LocalDate.now();
        List<Match> generatedMatches = new ArrayList<>();

        for (int round = 0; round < totalRounds; round++) {
            OffsetDateTime matchDateTime = currentDate.atTime(15, 30).atOffset(ZoneOffset.of("-05:00"));

            for (int i = 0; i < matchesPerRound; i++) {
                UUID teamA = teams.get(i);
                UUID teamB = teams.get(totalTeams - 1 - i);

                if (!teamA.equals(byeId) && !teamB.equals(byeId)) {
                    boolean isEvenRound = round % 2 == 0;
                    UUID localId = isEvenRound ? teamA : teamB;
                    UUID visitaId = isEvenRound ? teamB : teamA;

                    Match match = Match.builder()
                            .torneo(tournament)
                            .clubLocal(clubMap.get(localId))
                            .clubVisita(clubMap.get(visitaId))
                            .fechaHora(matchDateTime)
                            .estado(MatchStatus.PROGRAMADO)
                            .golesLocal(0)
                            .golesVisita(0)
                            .build();

                    generatedMatches.add(match);
                }
            }

            // Rotación circular Round-Robin: el primer equipo queda fijo
            UUID fixed = teams.get(0);
            List<UUID> rotating = new ArrayList<>(teams.subList(1, teams.size()));
            UUID last = rotating.remove(rotating.size() - 1);
            rotating.add(0, last);

            teams.clear();
            teams.add(fixed);
            teams.addAll(rotating);

            currentDate = currentDate.plusDays(7);
        }

        return matchRepository.saveAll(generatedMatches);
    }

    private TournamentResponse mapToResponse(Tournament t) {
        return TournamentResponse.builder()
                .id(t.getId())
                .nombre(t.getNombre())
                .anio(t.getAnio())
                .formato(t.getFormato())
                .puntosVictoria(t.getPuntosVictoria())
                .puntosEmpate(t.getPuntosEmpate())
                .puntosDerrota(t.getPuntosDerrota())
                .maxAmarillasSuspension(t.getMaxAmarillasSuspension())
                .totalPartidos(t.getPartidos() != null ? t.getPartidos().size() : 0)
                .build();
    }
}
