import { Role } from "./user.model";

export interface RegistrationRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegistrationResponse {
  status: string;
  message: string;
  userId?: number;
  role?: Role;
}