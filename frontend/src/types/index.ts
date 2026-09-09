export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface DocumentOwner {
  id: number;
  username: string;
}

export interface CsvDocument {
  id: number;
  originalName: string;
  storedName: string;
  storageKey: string;
  recordCount: number;
  userId: number;
  uploadedAt: string;
  uploadedBy?: DocumentOwner;
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
