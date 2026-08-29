import api from '../../../lib/axios';

export interface CustomerContact {
  id: string;
  customer_id: string;
  customer_name?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerContactPayload {
  customer_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
}

export interface UpdateCustomerContactPayload {
  customer_id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
}

export const customerContactService = {
  getAll: async (customerId?: string, search?: string): Promise<CustomerContact[]> => {
    const params: Record<string, string> = {};
    if (customerId) params.customer_id = customerId;
    if (search) params.search = search;
    const res = await api.get('/customer-contacts', { params });
    return res.data.data ?? [];
  },

  getByCustomerId: async (customerId: string, search?: string): Promise<CustomerContact[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    const res = await api.get(`/customers/${customerId}/contacts`, { params });
    return res.data.data ?? [];
  },

  getById: async (id: string): Promise<CustomerContact> => {
    const res = await api.get(`/customer-contacts/${id}`);
    return res.data.data;
  },

  create: async (data: CreateCustomerContactPayload): Promise<CustomerContact> => {
    const res = await api.post('/customer-contacts', data);
    return res.data.data;
  },

  createForCustomer: async (customerId: string, data: Omit<CreateCustomerContactPayload, 'customer_id'>): Promise<CustomerContact> => {
    const res = await api.post(`/customers/${customerId}/contacts`, data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateCustomerContactPayload): Promise<CustomerContact> => {
    const res = await api.put(`/customer-contacts/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customer-contacts/${id}`);
  },
};
