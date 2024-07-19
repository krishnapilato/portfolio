import { Role } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  token: string;
  expiresIn: number;
  errorCode: string;
  role: Role;
}