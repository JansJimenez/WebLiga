import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.club.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { jugadores: true },
        },
      },
      orderBy: { nombre_oficial: 'asc' },
    });
  }

  async findOne(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        jugadores: {
          where: { habilitado: true },
          orderBy: { numero_camiseta: 'asc' },
        },
      },
    });

    if (!club) {
      throw new NotFoundException(`Club con ID ${id} no encontrado`);
    }

    return club;
  }

  async create(data: {
    nombre_oficial: string;
    nombre_corto: string;
    fundacion_year?: number;
    logo_url?: string;
    color_principal?: string;
    color_secundario?: string;
  }) {
    return this.prisma.club.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.club.update({
      where: { id },
      data,
    });
  }
}
