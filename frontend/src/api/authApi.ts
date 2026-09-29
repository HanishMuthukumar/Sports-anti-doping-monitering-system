import api from './axiosInstance';
import { User } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/api/auth/login/', credentials);
    return res.data as { access: string; refresh: string; user: User };
  },
  logout: async (refresh: string) => {
    const res = await api.post('/api/auth/logout/', { refresh });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/api/auth/me/');
    return res.data as User;
  },
};
