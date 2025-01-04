export interface User {
  id?: number;
  fullName: string;
  email: string;
  passwordHash: string; // Store hashed password, not the plain text password
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date; // Track when the user last logged in
  isActive: boolean; // Flag for user account status
  locked?: boolean; // Optional field for account lock status
  role: Role; // User's role
  permissions?: string[]; // Optional field for additional user permissions
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  MODERATOR = 'MODERATOR',
  SUPER_ADMIN = 'SUPER_ADMIN'
}
