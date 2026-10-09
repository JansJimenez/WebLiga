import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../dto/register.dto';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (UserRoleEnum | string)[]) => SetMetadata(ROLES_KEY, roles);
