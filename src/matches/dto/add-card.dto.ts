import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export enum CardTypeEnum {
  AMARILLA = 'AMARILLA',
  ROJA = 'ROJA',
}

export class AddCardDto {
  @IsUUID('4')
  @IsNotEmpty()
  jugador_id: string;

  @IsEnum(CardTypeEnum)
  tipo: CardTypeEnum;

  @IsInt()
  @Min(1)
  @Max(130)
  minuto: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
