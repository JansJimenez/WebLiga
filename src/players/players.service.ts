import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clubId?: string) {
    return this.prisma.player.findMany({
      where: clubId ? { club_id: clubId } : undefined,
      include: {
        club: {
          select: { id: true, nombre_oficial: true, nombre_corto: true },
        },
      },
      orderBy: { apellidos: 'asc' },
    });
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        club: true,
        sanciones: { where: { activa: true } },
        tarjetas: true,
        goles: true,
      },
    });

    if (!player) {
      throw new NotFoundException(`Jugador con ID ${id} no encontrado`);
    }

    return player;
  }

  async create(createPlayerDto: CreatePlayerDto) {
    // 1. Validar DNI único
    const existingPlayer = await this.prisma.player.findUnique({
      where: { dni: createPlayerDto.dni.trim() },
    });

    if (existingPlayer) {
      throw new ConflictException(
        `Ya existe un jugador registrado con el DNI ${createPlayerDto.dni}`,
      );
    }

    // 2. Verificar existencia del club
    const clubExists = await this.prisma.club.findUnique({
      where: { id: createPlayerDto.club_id },
    });

    if (!clubExists) {
      throw new NotFoundException('El club especificado no existe');
    }

    // 3. Crear registro del jugador
    return this.prisma.player.create({
      data: {
        ...createPlayerDto,
        dni: createPlayerDto.dni.trim(),
        fecha_nacimiento: new Date(createPlayerDto.fecha_nacimiento),
      },
      include: { club: true },
    });
  }

  /**
   * Genera la estructura de datos del Carnet Digital para verificación QR
   */
  async generateDigitalCard(id: string) {
    const player = await this.findOne(id);

    const hasActivePenalties = player.sanciones.some((s) => s.activa);
    const isElegible = player.habilitado && player.estado_medico && !hasActivePenalties;

    return {
      carnet_id: `LPF-${player.id.substring(0, 8).toUpperCase()}`,
      dni: player.dni,
      nombre_completo: `${player.nombres} ${player.apellidos}`,
      club: player.club.nombre_oficial,
      posicion: player.posicion || 'No especificada',
      numero_camiseta: player.numero_camiseta,
      estado_medico_valido: player.estado_medico,
      habilitado_administrativo: player.habilitado,
      tiene_sanciones_activas: hasActivePenalties,
      estado_cancha: isElegible ? 'HABILITADO' : 'INHABILITADO',
      codigo_verificacion_qr: Buffer.from(
        JSON.stringify({
          pid: player.id,
          dni: player.dni,
          status: isElegible ? 'OK' : 'BLOCKED',
          ts: Date.now(),
        }),
      ).toString('base64'),
    };
  }
}
