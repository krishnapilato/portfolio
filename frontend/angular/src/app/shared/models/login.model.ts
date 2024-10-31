import { Role } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  message: string;
  token: string;
  expiresIn: number;
  errorCode?: string;
  role: Role;
}