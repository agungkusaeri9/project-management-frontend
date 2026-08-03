import api from '../../../lib/axios';

export interface Customer {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const customerService = {
  getAll: async (params?: GetCustomersParams) => {
    const response = await api.get<{ data: PaginatedResponse<Customer> }>('/customers', { params });
    return response.data.data;
  },
  
  create: async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};
