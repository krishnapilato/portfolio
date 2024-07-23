export interface User {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
}

export enum Role {
  USER,
  ADMIN,
  DEVELOPER,
}