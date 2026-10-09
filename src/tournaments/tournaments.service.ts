import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { MatchStatus, TournamentFormat } from '@prisma/client';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tournament.findMany({
      include: {
        _count: {
          select: { partidos: true },
        },
      },
      orderBy: { anio: 'desc' },
    });
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        partidos: {
          include: {
            club_local: { select: { id: true, nombre_oficial: true, nombre_corto: true } },
            club_visita: { select: { id: true, nombre_oficial: true, nombre_corto: true } },
          },
          orderBy: { fecha_hora: 'asc' },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException(`Torneo con ID ${id} no encontrado`);
    }

    return tournament;
  }

  async create(createTournamentDto: CreateTournamentDto) {
    return this.prisma.tournament.create({
      data: {
        ...createTournamentDto,
        formato: createTournamentDto.formato as TournamentFormat,
      },
    });
  }

  /**
   * Algoritmo Round-Robin (Sistema Berger) para generación de fixture
   * Genera todos los enfrentamientos garantizando alternancia de localía.
   */
  async generateRoundRobinFixture(tournamentId: string, clubIds: string[], startDate: Date = new Date()) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('El torneo no existe');
    }

    if (clubIds.length < 2) {
      throw new BadRequestException('Se requieren al menos 2 clubes para generar un fixture');
    }

    // Copiar lista de clubes
    const teams = [...clubIds];
    const isOdd = teams.length % 2 !== 0;

    // Si es impar, se agrega un equipo ficticio (bye / fecha libre)
    if (isOdd) {
      teams.push('BYE');
    }

    const totalTeams = teams.length;
    const totalRounds = totalTeams - 1;
    const matchesPerRound = totalTeams / 2;

    const scheduledMatches: Array<{
      torneo_id: string;
      club_local_id: string;
      club_visita_id: string;
      fecha_hora: Date;
      estado: MatchStatus;
    }> = [];

    let matchDateCursor = new Date(startDate);

    for (let round = 0; round < totalRounds; round++) {
      // Fecha de la jornada (ejemplo: cada 7 días los domingos)
      const roundDate = new Date(matchDateCursor);

      for (let i = 0; i < matchesPerRound; i++) {
        const home = teams[i];
        const away = teams[totalTeams - 1 - i];

        // Omitir si alguno es el equipo libre (BYE)
        if (home !== 'BYE' && away !== 'BYE') {
          // Alternancia de localía según la ronda para equidad
          const isEvenRound = round % 2 === 0;
          const local = isEvenRound ? home : away;
          const visita = isEvenRound ? away : home;

          scheduledMatches.push({
            torneo_id: tournamentId,
            club_local_id: local,
            club_visita_id: visita,
            fecha_hora: roundDate,
            estado: MatchStatus.PROGRAMADO,
          });
        }
      }

      // Rotación circular Round-Robin: el primer equipo se mantiene fijo
      const fixedTeam = teams[0];
      const remainingTeams = teams.slice(1);
      const lastTeam = remainingTeams.pop()!;
      remainingTeams.unshift(lastTeam);
      teams.splice(0, teams.length, fixedTeam, ...remainingTeams);

      // Incrementar una semana para la siguiente jornada
      matchDateCursor.setDate(matchDateCursor.getDate() + 7);
    }

    // Persistir partidos en lote dentro de una transacción
    return this.prisma.$transaction(async (tx) => {
      const createdMatches = [];
      for (const m of scheduledMatches) {
        const created = await tx.match.create({
          data: m,
          include: {
            club_local: { select: { nombre_corto: true } },
            club_visita: { select: { nombre_corto: true } },
          },
        });
        createdMatches.push(created);
      }
      return {
        message: `Fixture Round-Robin generado exitosamente: ${totalRounds} jornadas, ${createdMatches.length} partidos creados`,
        jornadas_totales: totalRounds,
        partidos: createdMatches,
      };
    });
  }
}
