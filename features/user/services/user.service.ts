import api from '../../../lib/axios';

export interface UserItem {
  id: string;
  name: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const userService = {
  getAll: async (): Promise<UserItem[]> => {
    const res = await api.get('/users');
    return res.data.data;
  },
  getById: async (id: string): Promise<UserItem> => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },
  create: async (data: any): Promise<UserItem> => {
    const res = await api.post('/users', data);
    return res.data.data;
  },
  update: async (id: string, data: any): Promise<UserItem> => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
