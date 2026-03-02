import { Role } from '@prisma/client';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: Role;

  };
}

export enum UserRole {
  STUDENT = 'student',
  OWNER = 'hostelOwner',
}