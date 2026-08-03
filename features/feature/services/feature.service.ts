import api from '../../../lib/axios';

export interface Feature {
  id: string;
  module_id: string;
  name: string;
  description: string | null;
  status: string; sort_order: number;
  created_at: string;
  updated_at: string;
}

export const featureService = {
  getByParentId: async (parentId: string): Promise<Feature[]> => {
    const parentPath = 'modules';
    const res = await api.get(`/${parentPath}/${parentId}/features`);
    return res.data.data;
  },
  create: async (data: any): Promise<Feature> => {
    const res = await api.post('/features', data);
    return res.data.data;
  },
  update: async (id: string, data: any): Promise<Feature> => {
    const res = await api.put(`/features/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/features/${id}`);
  },
};
