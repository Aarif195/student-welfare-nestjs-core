import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('student' | 'owner' | 'superadmin')[]) => 
  SetMetadata(ROLES_KEY, roles);