import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRoleEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DELEGADO = 'DELEGADO',
  ARBITRO = 'ARBITRO',
  PUBLICO = 'PUBLICO',
}

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(UserRoleEnum, { message: 'El rol proporcionado no es válido (SUPER_ADMIN, DELEGADO, ARBITRO, PUBLICO)' })
  role?: UserRoleEnum;
}
