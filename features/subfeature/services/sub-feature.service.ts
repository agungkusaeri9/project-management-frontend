import api from '../../../lib/axios';

export interface SubFeature {
  id: string;
  feature_id: string;
  name: string;
  description: string | null;
  status: string; sort_order: number;
  created_at: string;
  updated_at: string;
}

export const subFeatureService = {
  getByParentId: async (parentId: string): Promise<SubFeature[]> => {
    const parentPath = 'features';
    const res = await api.get(`/${parentPath}/${parentId}/sub-features`);
    return res.data.data;
  },
  create: async (data: any): Promise<SubFeature> => {
    const res = await api.post('/sub-features', data);
    return res.data.data;
  },
  update: async (id: string, data: any): Promise<SubFeature> => {
    const res = await api.put(`/sub-features/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sub-features/${id}`);
  },
};
