import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddGoalDto } from './dto/add-goal.dto';
import { AddCardDto } from './dto/add-card.dto';
import { CardType, MatchStatus } from '@prisma/client';

export interface LineupValidationResult {
  valido: boolean;
  partido_id: string;
  total_jugadores: number;
  jugadores_habilitados: Array<{
    id: string;
    dni: string;
    nombre_completo: string;
    club: string;
    numero_camiseta: number | null;
  }>;
}

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        torneo: true,
        club_local: true,
        club_visita: true,
        goles: {
          include: { jugador: { select: { nombres: true, apellidos: true } } },
          orderBy: { minuto: 'asc' },
        },
        tarjetas: {
          include: { jugador: { select: { nombres: true, apellidos: true } } },
          orderBy: { minuto: 'asc' },
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Partido con ID '${id}' no encontrado`);
    }

    return match;
  }

  /**
   * REGLA DE NEGOCIO: Validación Previa de Planilla de Alineación
   * Impide la inclusión de cualquier futbolista inhabilitado administrativamente,
   * sin apto médico vigente, o con sanción disciplinaria activa (Alineación Indebida).
   */
  async validateLineup(matchId: string, playerIds: string[]): Promise<LineupValidationResult> {
    const match = await this.findOne(matchId);

    if (match.estado === MatchStatus.FINALIZADO) {
      throw new BadRequestException('No se puede modificar ni validar la alineación de un partido FINALIZADO');
    }

    if (!playerIds || playerIds.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un jugador para validar la planilla');
    }

    // Consultar jugadores con su club y sanciones disciplinarias activas
    const players = await this.prisma.player.findMany({
      where: {
        id: { in: playerIds },
      },
      include: {
        club: true,
        sanciones: {
          where: { activa: true },
        },
      },
    });

    if (players.length !== playerIds.length) {
      throw new NotFoundException('Uno o más jugadores enviados no existen en los registros de la Liga');
    }

    const validPlayers = [];

    for (const player of players) {
      const nombreCompleto = `${player.nombres} ${player.apellidos}`;

      // 1. Validar pertenencia a alguno de los clubes del partido
      const belongsToMatchClubs =
        player.club_id === match.club_local_id || player.club_id === match.club_visita_id;

      if (!belongsToMatchClubs) {
        throw new ForbiddenException(
          `Alineación indebida: El jugador ${nombreCompleto} pertenece a '${player.club.nombre_oficial}', equipo ajeno a este encuentro.`,
        );
      }

      // 2. Validar habilitación administrativa
      if (!player.habilitado) {
        throw new ForbiddenException(
          `Alineación rechazada: El jugador ${nombreCompleto} (DNI ${player.dni}) se encuentra inhabilitado administrativamente por la Liga.`,
        );
      }

      // 3. Validar estado médico
      if (!player.estado_medico) {
        throw new ForbiddenException(
          `Alineación rechazada: El jugador ${nombreCompleto} (DNI ${player.dni}) NO cuenta con examen médico preventivo vigente.`,
        );
      }

      // 4. Validar sanciones disciplinarias activas
      const activePenalty = player.sanciones.find((s) => s.activa);
      if (activePenalty) {
        throw new ForbiddenException(
          `Alineación rechazada: El jugador ${nombreCompleto} (DNI ${player.dni}) tiene una SANCIÓN DISCIPLINARIA ACTIVA. Motivo: "${activePenalty.motivo}". Fechas cumplidas: ${activePenalty.fechas_cumplidas}/${activePenalty.fechas_suspension}.`,
        );
      }

      validPlayers.push({
        id: player.id,
        dni: player.dni,
        nombre_completo: nombreCompleto,
        club: player.club.nombre_corto,
        numero_camiseta: player.numero_camiseta,
      });
    }

    return {
      valido: true,
      partido_id: match.id,
      total_jugadores: validPlayers.length,
      jugadores_habilitados: validPlayers,
    };
  }

  /**
   * REGLA DE NEGOCIO: Registro de Goles con Control Transaccional e Inmutabilidad
   */
  async addGoal(matchId: string, addGoalDto: AddGoalDto) {
    const match = await this.findOne(matchId);

    if (match.estado === MatchStatus.FINALIZADO) {
      throw new BadRequestException(
        'El acta de este partido ya ha sido cerrada y es estrictamente INMUTABLE',
      );
    }

    // Transacción atómica en PostgreSQL
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el evento de gol
      const goal = await tx.goal.create({
        data: {
          partido_id: matchId,
          jugador_id: addGoalDto.jugador_id,
          equipo_id: addGoalDto.equipo_id,
          minuto: addGoalDto.minuto,
        },
        include: {
          jugador: { select: { nombres: true, apellidos: true } },
          equipo: { select: { nombre_corto: true } },
        },
      });

      // 2. Actualizar marcador y asegurar estado EN_JUEGO
      const isLocal = addGoalDto.equipo_id === match.club_local_id;
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          goles_local: isLocal ? { increment: 1 } : undefined,
          goles_visita: !isLocal ? { increment: 1 } : undefined,
          estado: MatchStatus.EN_JUEGO,
        },
      });

      return {
        mensaje: 'Gol registrado con éxito',
        gol: goal,
        marcador_actual: {
          local: updatedMatch.goles_local,
          visita: updatedMatch.goles_visita,
        },
      };
    });
  }

  /**
   * REGLA DE NEGOCIO: Registro de Tarjetas y Control Automático de Sanciones
   * Manejo 100% transaccional con Prisma (prisma.$transaction):
   * 1. Doble Amarilla en el mismo partido -> Expulsión y sanción automática de 1 fecha.
   * 2. Roja Directa -> Sanción automática de al menos 1 fecha.
   * 3. Tarjeta Amarilla con acumulación -> Evalúa si el jugador alcanza el umbral de N amarillas
   *    del torneo (ej. 3 o 5) y genera suspensión para la siguiente jornada.
   */
  async addCard(matchId: string, addCardDto: AddCardDto) {
    const match = await this.findOne(matchId);

    // Inmutabilidad de actas finalizadas
    if (match.estado === MatchStatus.FINALIZADO) {
      throw new BadRequestException(
        'El acta de este partido ya ha sido cerrada y es estrictamente INMUTABLE',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const { jugador_id, tipo, minuto, motivo } = addCardDto;
      const tournamentId = match.torneo_id;
      const maxAmarillas = match.torneo.max_amarillas_suspension;

      // Obtener datos del jugador para detalle de sanción
      const player = await tx.player.findUnique({
        where: { id: jugador_id },
      });

      if (!player) {
        throw new NotFoundException('El jugador especificado no existe');
      }

      const playerName = `${player.nombres} ${player.apellidos}`;

      // -----------------------------------------------------------------------
      // ESCENARIO 1: TARJETA AMARILLA (Evaluar Doble Amarilla o Acumulación)
      // -----------------------------------------------------------------------
      if (tipo === CardType.AMARILLA) {
        // Verificar si el jugador ya tiene una tarjeta amarilla PREVIA en ESTE MISMO partido
        const yellowCardsInThisMatch = await tx.card.count({
          where: {
            partido_id: matchId,
            jugador_id,
            tipo: CardType.AMARILLA,
          },
        });

        // Caso A: Ya tenía una amarilla -> ¡Doble Amarilla = Expulsión Automática!
        if (yellowCardsInThisMatch >= 1) {
          const card = await tx.card.create({
            data: {
              partido_id: matchId,
              jugador_id,
              tipo: CardType.AMARILLA,
              minuto,
              motivo: motivo
                ? `${motivo} (Segunda amonestación en el partido - Expulsión)`
                : 'Segunda tarjeta amarilla en el partido (Expulsión)',
            },
          });

          // Crear sanción automática inmediata por expulsión indirecta (doble amarilla)
          const penalty = await tx.penalty.create({
            data: {
              jugador_id,
              fechas_suspension: 1, // Mínimo 1 fecha de suspensión
              fechas_cumplidas: 0,
              motivo: `Expulsión por doble tarjeta amarilla en partido ${match.club_local.nombre_corto} vs ${match.club_visita.nombre_corto} (Min. ${minuto})`,
              activa: true,
            },
          });

          return {
            mensaje: `¡Segunda amonestación para ${playerName}! Expulsión por doble amarilla y suspensión automática de 1 fecha aplicada.`,
            tarjeta: card,
            sancion_generada: penalty,
            expulsion: true,
            tipo_expulsion: 'DOBLE_AMARILLA',
          };
        }

        // Caso B: Primera amarilla en este partido
        const card = await tx.card.create({
          data: {
            partido_id: matchId,
            jugador_id,
            tipo: CardType.AMARILLA,
            minuto,
            motivo: motivo || 'Conducta antideportiva / Falta táctica',
          },
        });

        // Contar el total histórico de tarjetas amarillas acumuladas en el presente torneo
        const totalTournamentYellows = await tx.card.count({
          where: {
            partido: { torneo_id: tournamentId },
            jugador_id,
            tipo: CardType.AMARILLA,
          },
        });

        // Verificar si alcanza el límite de acumulación configurado en el torneo (ej. 3 o 5)
        let penalty = null;
        if (totalTournamentYellows > 0 && totalTournamentYellows % maxAmarillas === 0) {
          penalty = await tx.penalty.create({
            data: {
              jugador_id,
              fechas_suspension: 1,
              fechas_cumplidas: 0,
              motivo: `Suspensión automática por acumulación de ${totalTournamentYellows} tarjetas amarillas en el torneo (Límite: cada ${maxAmarillas} amarillas)`,
              activa: true,
            },
          });
        }

        return {
          mensaje: penalty
            ? `Tarjeta amarilla registrada. El jugador acumula ${totalTournamentYellows} amarillas y queda SUSPENDIDO para la próxima fecha.`
            : `Tarjeta amarilla registrada con éxito (${totalTournamentYellows} acumuladas en el torneo).`,
          tarjeta: card,
          total_amarillas_torneo: totalTournamentYellows,
          limite_alcanzado: !!penalty,
          sancion_generada: penalty,
          expulsion: false,
        };
      }

      // -----------------------------------------------------------------------
      // ESCENARIO 2: TARJETA ROJA DIRECTA
      // -----------------------------------------------------------------------
      const card = await tx.card.create({
        data: {
          partido_id: matchId,
          jugador_id,
          tipo: CardType.ROJA,
          minuto,
          motivo: motivo || 'Falta grave / Agresión / Expulsión directa',
        },
      });

      // Crear sanción disciplinaria automática por tarjeta roja (mínimo 1 fecha)
      const penalty = await tx.penalty.create({
        data: {
          jugador_id,
          fechas_suspension: 1,
          fechas_cumplidas: 0,
          motivo: motivo
            ? `Expulsión directa: ${motivo} (Min. ${minuto})`
            : `Expulsión con tarjeta roja directa en partido (Min. ${minuto})`,
          activa: true,
        },
      });

      return {
        mensaje: `Tarjeta roja directa registrada para ${playerName}. Sanción disciplinaria automática aplicada.`,
        tarjeta: card,
        sancion_generada: penalty,
        expulsion: true,
        tipo_expulsion: 'ROJA_DIRECTA',
      };
    });
  }

  /**
   * REGLA DE NEGOCIO: Cierre de Partido e Inmutabilidad del Acta
   * Ejecuta en una sola transacción ACID:
   * 1. Consolidación de marcador definitivo a partir de los registros de goles.
   * 2. Transición irrevocable al estado FINALIZADO.
   * 3. Cómputo de cumplimiento de sanciones para los jugadores que estaban suspendidos
   *    y cumplieron su fecha de castigo en este encuentro.
   */
  async closeMatch(matchId: string) {
    const match = await this.findOne(matchId);

    if (match.estado === MatchStatus.FINALIZADO) {
      throw new BadRequestException('El partido ya se encuentra en estado FINALIZADO');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Recalcular marcador oficial a partir de los eventos de gol auditados
      const golesLocal = await tx.goal.count({
        where: { partido_id: matchId, equipo_id: match.club_local_id },
      });

      const golesVisita = await tx.goal.count({
        where: { partido_id: matchId, equipo_id: match.club_visita_id },
      });

      // 2. Transición de estado a FINALIZADO (Inmutabilidad sellada)
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          goles_local: golesLocal,
          goles_visita: golesVisita,
          estado: MatchStatus.FINALIZADO,
        },
      });

      // 3. Cumplimiento de fechas de sanción para futbolistas de los clubes que disputaron la jornada
      const activePenalties = await tx.penalty.findMany({
        where: {
          activa: true,
          jugador: {
            club_id: { in: [match.club_local_id, match.club_visita_id] },
          },
        },
      });

      const updatedPenalties = [];
      for (const penalty of activePenalties) {
        const fechasCumplidas = penalty.fechas_cumplidas + 1;
        const sigueActiva = fechasCumplidas < penalty.fechas_suspension;

        const updated = await tx.penalty.update({
          where: { id: penalty.id },
          data: {
            fechas_cumplidas: fechasCumplidas,
            activa: sigueActiva,
          },
        });
        updatedPenalties.push(updated);
      }

      return {
        mensaje: 'Acta de partido cerrada y sellada formalmente. Datos inmutables.',
        marcador_final: `${updatedMatch.goles_local} - ${updatedMatch.goles_visita}`,
        partido: updatedMatch,
        sanciones_actualizadas: updatedPenalties.length,
      };
    });
  }
}
