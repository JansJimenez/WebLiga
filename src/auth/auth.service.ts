import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, UserRoleEnum } from './dto/register.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registro de nuevos usuarios con encriptación bcrypt y rol por defecto
   */
  async register(registerDto: RegisterDto) {
    const { email, password, role } = registerDto;

    // Verificar unicidad de correo
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado en el sistema');
    }

    // Hasheo de contraseña con bcrypt (cost factor 12)
    const password_hash = await bcrypt.hash(password, this.saltRounds);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password_hash,
          role: (role as UserRole) || UserRole.PUBLICO,
        },
        select: {
          id: true,
          email: true,
          role: true,
          created_at: true,
        },
      });

      return {
        message: 'Usuario registrado exitosamente',
        user: newUser,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el usuario en la base de datos');
    }
  }

  /**
   * Autenticación de credenciales y generación de Token JWT
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (usuario o contraseña incorrectos)');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas (usuario o contraseña incorrectos)');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Obtiene el perfil actual del usuario autenticado
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
