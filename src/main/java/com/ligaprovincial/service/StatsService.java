package com.ligaprovincial.service;

import com.ligaprovincial.dto.StandingsDTO;
import com.ligaprovincial.dto.TopScorerDTO;
import com.ligaprovincial.model.entity.Club;
import com.ligaprovincial.model.entity.Goal;
import com.ligaprovincial.model.entity.Match;
import com.ligaprovincial.model.entity.Tournament;
import com.ligaprovincial.model.enums.MatchStatus;
import com.ligaprovincial.repository.ClubRepository;
import com.ligaprovincial.repository.GoalRepository;
import com.ligaprovincial.repository.MatchRepository;
import com.ligaprovincial.repository.TournamentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final TournamentRepository tournamentRepository;
    private final MatchRepository matchRepository;
    private final ClubRepository clubRepository;
    private final GoalRepository goalRepository;

    /**
     * Cómputo matemático oficial de la Tabla de Posiciones para un Torneo.
     * Criterio de ordenamiento federativo en cascada:
     * 1º Puntos Totales (PTS)
     * 2º Diferencia de Goles (DG = GF - GC)
     * 3º Goles a Favor (GF)
     * 4º Menor Goles en Contra (GC)
     * 5º Nombre del club alfabéticamente
     */
    @Transactional(readOnly = true)
    public List<StandingsDTO> calculateStandings(UUID tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new EntityNotFoundException("Torneo no encontrado"));

        int ptsWin = tournament.getPuntosVictoria();
        int ptsDraw = tournament.getPuntosEmpate();
        int ptsLoss = tournament.getPuntosDerrota();

        List<Match> finishedMatches = matchRepository.findAllByTorneoIdAndEstado(tournamentId, MatchStatus.FINALIZADO);
        List<Club> clubs = clubRepository.findAllByActivoTrueOrderByNombreOficialAsc();

        Map<UUID, StandingsDTO> tableMap = new HashMap<>();

        for (Club club : clubs) {
            tableMap.put(club.getId(), StandingsDTO.builder()
                    .posicion(0)
                    .clubId(club.getId())
                    .nombreClub(club.getNombreOficial())
                    .nombreCorto(club.getNombreCorto())
                    .logoUrl(club.getLogoUrl())
                    .pj(0).pg(0).pe(0).pp(0)
                    .gf(0).gc(0).dg(0).puntos(0)
                    .build());
        }

        for (Match match : finishedMatches) {
            StandingsDTO local = tableMap.get(match.getClubLocal().getId());
            StandingsDTO visita = tableMap.get(match.getClubVisita().getId());

            if (local == null || visita == null) continue;

            int gl = match.getGolesLocal() != null ? match.getGolesLocal() : 0;
            int gv = match.getGolesVisita() != null ? match.getGolesVisita() : 0;

            local.setPj(local.getPj() + 1);
            visita.setPj(visita.getPj() + 1);

            local.setGf(local.getGf() + gl);
            local.setGc(local.getGc() + gv);
            visita.setGf(visita.getGf() + gv);
            visita.setGc(visita.getGc() + gl);

            if (gl > gv) {
                local.setPg(local.getPg() + 1);
                local.setPuntos(local.getPuntos() + ptsWin);
                visita.setPp(visita.getPp() + 1);
                visita.setPuntos(visita.getPuntos() + ptsLoss);
            } else if (gl == gv) {
                local.setPe(local.getPe() + 1);
                local.setPuntos(local.getPuntos() + ptsDraw);
                visita.setPe(visita.getPe() + 1);
                visita.setPuntos(visita.getPuntos() + ptsDraw);
            } else {
                visita.setPg(visita.getPg() + 1);
                visita.setPuntos(visita.getPuntos() + ptsWin);
                local.setPp(local.getPp() + 1);
                local.setPuntos(local.getPuntos() + ptsLoss);
            }
        }

        List<StandingsDTO> standings = new ArrayList<>(tableMap.values());
        for (StandingsDTO row : standings) {
            row.setDg(row.getGf() - row.getGc());
        }

        // Ordenamiento oficial federativo
        standings.sort((a, b) -> {
            if (b.getPuntos() != a.getPuntos()) {
                return Integer.compare(b.getPuntos(), a.getPuntos()); // 1º Puntos
            }
            if (b.getDg() != a.getDg()) {
                return Integer.compare(b.getDg(), a.getDg());         // 2º Diferencia de Gol
            }
            if (b.getGf() != a.getGf()) {
                return Integer.compare(b.getGf(), a.getGf());         // 3º Goles a Favor
            }
            if (a.getGc() != b.getGc()) {
                return Integer.compare(a.getGc(), b.getGc());         // 4º Menor Goles en Contra
            }
            return a.getNombreClub().compareToIgnoreCase(b.getNombreClub()); // 5º Alfabético
        });

        for (int i = 0; i < standings.size(); i++) {
            standings.get(i).setPosicion(i + 1);
        }

        return standings;
    }

    /**
     * Ranking individual de máximos goleadores del torneo
     */
    @Transactional(readOnly = true)
    public List<TopScorerDTO> getTopScorers(UUID tournamentId) {
        List<Goal> goals = goalRepository.findAllByPartidoTorneoIdAndPartidoEstado(tournamentId, MatchStatus.FINALIZADO);

        Map<UUID, TopScorerDTO> scorersMap = new HashMap<>();

        for (Goal g : goals) {
            UUID playerId = g.getJugador().getId();
            scorersMap.computeIfAbsent(playerId, id -> TopScorerDTO.builder()
                    .jugadorId(id)
                    .nombres(g.getJugador().getNombres())
                    .apellidos(g.getJugador().getApellidos())
                    .club(g.getEquipo().getNombreCorto())
                    .logoClub(g.getEquipo().getLogoUrl())
                    .totalGoles(0)
                    .build());

            TopScorerDTO dto = scorersMap.get(playerId);
            dto.setTotalGoles(dto.getTotalGoles() + 1);
        }

        List<TopScorerDTO> list = new ArrayList<>(scorersMap.values());
        list.sort((a, b) -> Long.compare(b.getTotalGoles(), a.getTotalGoles()));
        return list;
    }
}
