export interface User {
  id?: number;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  locked?: boolean;
  role: Role;
  permissions?: string[];
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
}