import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../../src/api/axios', () => ({
  default: { post: vi.fn() },
}));

import apiClient from '../../src/api/axios';
import { useAuthStore } from '../../src/store/auth';

const mockedPost = apiClient.post as unknown as ReturnType<typeof vi.fn>;

describe('store/auth', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('inicia sin usuario ni token cuando localStorage esta vacio', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isAdmin).toBe(false);
  });

  it('login guarda el token y el usuario en el estado y en localStorage', async () => {
    mockedPost.mockResolvedValue({
      data: { data: { token: 'jwt-token', user: { id: 1, username: 'juan', role: 'admin' } } },
    });

    const store = useAuthStore();
    await store.login({ username: 'juan', password: 'secret123' });

    expect(store.token).toBe('jwt-token');
    expect(store.isAuthenticated).toBe(true);
    expect(store.isAdmin).toBe(true);
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('logout limpia el estado y localStorage', async () => {
    mockedPost.mockResolvedValue({
      data: { data: { token: 'jwt-token', user: { id: 1, username: 'juan', role: 'user' } } },
    });
    const store = useAuthStore();
    await store.login({ username: 'juan', password: 'secret123' });

    store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('register delega en el cliente HTTP y retorna los datos del usuario creado', async () => {
    mockedPost.mockResolvedValue({ data: { data: { id: 1, username: 'juan', role: 'user' } } });

    const store = useAuthStore();
    const result = await store.register({
      username: 'juan',
      password: 'secret123',
      confirmPassword: 'secret123',
      role: 'user',
    });

    expect(mockedPost).toHaveBeenCalledWith(
      '/auth/register',
      expect.objectContaining({ username: 'juan' })
    );
    expect(result).toEqual({ id: 1, username: 'juan', role: 'user' });
  });
});
