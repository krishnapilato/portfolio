import { Role } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  token?: string;
  expiresIn?: number;
  errorCode?: string;
  errorMessage?: string;
  role: Role;
}
