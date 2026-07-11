export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  document_type?: string;
  document_number?: string;
  last_lat?: number;
  last_lng?: number;
  last_active_at?: string;
  is_active: boolean;
  roles: Role[];
  created_at: string;
}

export interface Role {
  id: number;
  name: 'Administrador' | 'Ciudadano' | 'Autoridad';
  description: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  document_type?: 'dni' | 'ce' | 'passport';
  document_number?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  token_type: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  photo?: any;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}
