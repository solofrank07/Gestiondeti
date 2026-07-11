import api from './api';
import { ENDPOINTS } from '@/constants/api';
import { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest, User } from '@/types/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post(ENDPOINTS.REGISTER, data);
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post(ENDPOINTS.LOGIN, data);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post(ENDPOINTS.LOGOUT);
  },

  async getProfile(): Promise<User> {
    const res = await api.get(ENDPOINTS.PROFILE);
    return res.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const res = await api.put(ENDPOINTS.PROFILE, data);
    return res.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.post(ENDPOINTS.CHANGE_PASSWORD, data);
  },
};
