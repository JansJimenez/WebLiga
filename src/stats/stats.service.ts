import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '@prisma/client';

export interface StandingsRow {
  posicion: number;
  club_id: string;
  nombre_club: string;
  nombre_corto: string;
  logo_url: string | null;
  pj: number; // Partidos Jugados
  pg: number; // Partidos Ganados
  pe: number; // Partidos Empatados
  pp: number; // Partidos Perdidos
  gf: number; // Goles a Favor
  gc: number; // Goles en Contra
  dg: number; // Diferencia de Goles (GF - GC)
  puntos: number; // Puntos Totales (PTS)
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cómputo matemático oficial de la Tabla de Posiciones para un Torneo.
   * Procesa únicamente partidos con estado FINALIZADO y ordena estrictamente por:
   * 1º Puntos Totales (PTS)
   * 2º Diferencia de Goles (DG = GF - GC)
   * 3º Goles a Favor (GF)
   * 4º Menor cantidad de Goles en Contra (GC)
   * 5º Orden alfabético por nombre oficial del club (criterio de desempate final)
   */
  async calculateStandings(tournamentId: string): Promise<StandingsRow[]> {
    // 1. Obtener torneo con sus reglas de puntuación y partidos finalizados
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        partidos: {
          where: { estado: MatchStatus.FINALIZADO },
          include: {
            club_local: true,
            club_visita: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException(`El torneo con ID '${tournamentId}' no existe`);
    }

    const ptsWin = tournament.puntos_victoria;
    const ptsDraw = tournament.puntos_empate;
    const ptsLoss = tournament.puntos_derrota;

    // 2. Obtener todos los clubes que forman parte de la competencia
    // Se extraen tanto los clubes con partidos como los activos de la liga
    const allClubs = await this.prisma.club.findMany({
      where: { activo: true },
    });

    const standingsMap: Record<string, StandingsRow> = {};

    // 3. Inicializar contadores en cero para cada club
    allClubs.forEach((club) => {
      standingsMap[club.id] = {
        posicion: 0,
        club_id: club.id,
        nombre_club: club.nombre_oficial,
        nombre_corto: club.nombre_corto,
        logo_url: club.logo_url,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        puntos: 0,
      };
    });

    // 4. Procesar de forma acumulativa y determinística cada partido finalizado
    for (const match of tournament.partidos) {
      const local = standingsMap[match.club_local_id];
      const visita = standingsMap[match.club_visita_id];

      // Ignorar si alguno de los clubes no está en el mapa
      if (!local || !visita) continue;

      const gl = match.goles_local ?? 0;
      const gv = match.goles_visita ?? 0;

      // Partidos jugados
      local.pj += 1;
      visita.pj += 1;

      // Goles a favor y en contra
      local.gf += gl;
      local.gc += gv;
      visita.gf += gv;
      visita.gc += gl;

      // Asignación de resultados y puntos
      if (gl > gv) {
        // Victoria Local
        local.pg += 1;
        local.puntos += ptsWin;

        visita.pp += 1;
        visita.puntos += ptsLoss;
      } else if (gl === gv) {
        // Empate
        local.pe += 1;
        local.puntos += ptsDraw;

        visita.pe += 1;
        visita.puntos += ptsDraw;
      } else {
        // Victoria Visita
        visita.pg += 1;
        visita.puntos += ptsWin;

        local.pp += 1;
        local.puntos += ptsLoss;
      }
    }

    // 5. Calcular Diferencia de Goles (DG = GF - GC)
    const standingsList = Object.values(standingsMap).map((row) => ({
      ...row,
      dg: row.gf - row.gc,
    }));

    // 6. Ordenamiento reglamentario federativo en cascada:
    // 1º Puntos Totales (PTS desc)
    // 2º Diferencia de Goles (DG desc)
    // 3º Goles a Favor (GF desc)
    // 4º Menor Goles en Contra (GC asc)
    // 5º Orden alfabético (asc)
    standingsList.sort((a, b) => {
      // 1º Criterio: Puntos Totales
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos;
      }

      // 2º Criterio: Diferencia de Goles (DG)
      if (b.dg !== a.dg) {
        return b.dg - a.dg;
      }

      // 3º Criterio: Goles a Favor (GF)
      if (b.gf !== a.gf) {
        return b.gf - a.gf;
      }

      // 4º Criterio: Menos Goles en Contra (GC)
      if (a.gc !== b.gc) {
        return a.gc - b.gc;
      }

      // 5º Criterio de desempate determinista
      return a.nombre_club.localeCompare(b.nombre_club);
    });

    // 7. Asignar posiciones ordinales oficiales (1º, 2º, 3º...)
    standingsList.forEach((row, index) => {
      row.posicion = index + 1;
    });

    return standingsList;
  }

  /**
   * Alias de compatibilidad para el controlador
   */
  async getStandings(tournamentId: string): Promise<StandingsRow[]> {
    return this.calculateStandings(tournamentId);
  }

  /**
   * Cómputo de la Tabla de Goleadores (Pichichi) del torneo
   */
  async getTopScorers(tournamentId: string) {
    const goals = await this.prisma.goal.findMany({
      where: {
        partido: {
          torneo_id: tournamentId,
          estado: MatchStatus.FINALIZADO,
        },
      },
      include: {
        jugador: {
          include: {
            club: { select: { nombre_corto: true, logo_url: true } },
          },
        },
      },
    });

    const scorersMap: Record<
      string,
      {
        jugador_id: string;
        nombres: string;
        apellidos: string;
        club: string;
        logo_club: string | null;
        total_goles: number;
      }
    > = {};

    goals.forEach((g) => {
      if (!scorersMap[g.jugador_id]) {
        scorersMap[g.jugador_id] = {
          jugador_id: g.jugador_id,
          nombres: g.jugador.nombres,
          apellidos: g.jugador.apellidos,
          club: g.jugador.club.nombre_corto,
          logo_club: g.jugador.club.logo_url,
          total_goles: 0,
        };
      }
      scorersMap[g.jugador_id].total_goles += 1;
    });

    const topScorers = Object.values(scorersMap);
    topScorers.sort((a, b) => b.total_goles - a.total_goles);

    return topScorers;
  }
}
