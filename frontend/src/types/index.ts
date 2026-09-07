export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: number;
  nombre: string;
  rol: UserRole;
}

export interface LoginPayload {
  nombre: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  password: string;
  confirmarContrasena: string;
  rol: UserRole;
}

export interface DocumentOwner {
  id: number;
  nombre: string;
}

export interface CsvDocument {
  id: number;
  nombreOriginal: string;
  nombreAlmacenado: string;
  rutaArchivo: string;
  numRegistros: number;
  usuarioId: number;
  fecha_carga: string;
  usuario?: DocumentOwner;
}

export interface CsvFieldError {
  field: string;
  message: string;
}

export interface CsvRowErrorDetail {
  row: number;
  errors: CsvFieldError[];
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown[];
}
