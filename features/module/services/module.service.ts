import api from '../../../lib/axios';

export interface Module {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_additional?: boolean;
  additional_feature_id?: string | null;
  created_at: string;
  updated_at: string;
}

export const moduleService = {
  getByParentId: async (parentId: string): Promise<Module[]> => {
    const parentPath = 'projects';
    const res = await api.get(`/${parentPath}/${parentId}/modules`);
    return res.data.data;
  },
  create: async (data: any): Promise<Module> => {
    const res = await api.post('/modules', data);
    return res.data.data;
  },
  update: async (id: string, data: any): Promise<Module> => {
    const res = await api.put(`/modules/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/modules/${id}`);
  },
};
