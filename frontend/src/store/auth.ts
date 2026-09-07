import { defineStore } from 'pinia';
import apiClient from '../api/axios';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
    isAdmin: (state): boolean => state.user?.rol === 'admin',
  },

  actions: {
    async register(payload: RegisterPayload): Promise<AuthUser> {
      const { data } = await apiClient.post('/auth/register', payload);
      return data.data as AuthUser;
    },

    async login({ nombre, password }: LoginPayload): Promise<void> {
      const { data } = await apiClient.post('/auth/login', { nombre, password });
      const { token, user } = data.data as { token: string; user: AuthUser };

      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    logout(): void {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
