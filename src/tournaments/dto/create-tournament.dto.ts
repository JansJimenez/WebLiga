import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum TournamentFormatEnum {
  TODOS_CONTRA_TODOS = 'TODOS_CONTRA_TODOS',
  FASE_GRUPOS = 'FASE_GRUPOS',
}

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del torneo es obligatorio' })
  nombre: string;

  @IsInt()
  @Min(2020)
  anio: number;

  @IsEnum(TournamentFormatEnum, {
    message: 'El formato debe ser TODOS_CONTRA_TODOS o FASE_GRUPOS',
  })
  formato: TournamentFormatEnum;

  @IsOptional()
  @IsInt()
  puntos_victoria?: number;

  @IsOptional()
  @IsInt()
  puntos_empate?: number;

  @IsOptional()
  @IsInt()
  puntos_derrota?: number;

  @IsOptional()
  @IsInt()
  max_amarillas_suspension?: number;
}
