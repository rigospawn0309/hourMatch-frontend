import { UserRole } from "./role.enum";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  tipoUsuario: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email?: string;
  tipoUsuario?: UserRole;
  user?: any; // backend may return a masticated user object; typed as any to allow DTO shape
}

export interface RefreshTokenRequest {
  refreshToken: string;
}