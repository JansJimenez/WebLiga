import { IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class AddGoalDto {
  @IsUUID('4')
  @IsNotEmpty()
  jugador_id: string;

  @IsUUID('4')
  @IsNotEmpty()
  equipo_id: string;

  @IsInt()
  @Min(1)
  @Max(130)
  minuto: number;
}
