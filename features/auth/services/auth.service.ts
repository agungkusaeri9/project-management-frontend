import api from '../../../lib/axios';
import { LoginResponse } from '../types';
import { LoginFormData } from '../schemas/login.schema';

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', data);
    return response.data;
  },
};
