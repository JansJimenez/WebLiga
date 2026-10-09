import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePlayerDto {
  @IsUUID('4', { message: 'El club_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El club_id es requerido' })
  club_id: string;

  @IsString()
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  dni: string;

  @IsString()
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  nombres: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato ISO YYYY-MM-DD' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fecha_nacimiento: string;

  @IsOptional()
  @IsString()
  foto_url?: string;

  @IsOptional()
  @IsString()
  posicion?: string;

  @IsOptional()
  @IsNumber()
  numero_camiseta?: number;

  @IsOptional()
  @IsBoolean()
  estado_medico?: boolean;

  @IsOptional()
  @IsBoolean()
  habilitado?: boolean;
}
