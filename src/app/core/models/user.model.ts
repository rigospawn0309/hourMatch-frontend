import { UserRole } from "./role.enum";

export interface User {
  id: number;
  nombre: string;
  email: string;
  tipoUsuario: UserRole;
  ubicacion?: string;
  biografia?: string;
  fotoPerfil?: string;
  telefono?: string;
  verificado: boolean;
  fechaRegistro: Date;
}