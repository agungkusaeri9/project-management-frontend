import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

export interface SubFeature {
  id: string;
  feature_id: string;
  name: string;
  description: string | null;
  status: string;
  sort_order: number;
  is_additional: boolean;
  additional_feature_item_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  module_id: string;
  name: string;
  description: string | null;
  status: string;
  sort_order: number;
  is_additional: boolean;
  additional_feature_item_id?: string;
  created_at: string;
  updated_at: string;
  sub_features?: SubFeature[];
}

export interface Module {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_additional: boolean;
  additional_feature_item_id?: string;
  created_at: string;
  updated_at: string;
  features?: Feature[];
}

export interface AdditionalFeatureItem {
  id: string;
  additional_feature_id: string;
  name: string;
  description?: string;
  estimated_completion_date?: string;
  created_at?: string;
  updated_at?: string;
  modules?: Module[];
}

export interface AdditionalFeature {
  id: string;
  project_id: string;
  code?: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  start_date?: string;
  estimated_completion_date?: string;
  created_at?: string;
  updated_at?: string;
  items?: AdditionalFeatureItem[];
}

export const additionalFeatureService = {
  getAll: async (): Promise<AdditionalFeature[]> => {
    const response = await axios.get(`${API_URL}/additional-features`);
    return response.data.data;
  },

  getAllByProjectId: async (projectId: string): Promise<AdditionalFeature[]> => {
    const response = await axios.get(`${API_URL}/projects/${projectId}/additional-features`);
    return response.data.data;
  },

  getById: async (id: string): Promise<AdditionalFeature> => {
    const response = await axios.get(`${API_URL}/additional-features/${id}`);
    return response.data.data;
  },

  create: async (projectId: string, data: AdditionalFeature): Promise<AdditionalFeature> => {
    const response = await axios.post(`${API_URL}/projects/${projectId}/additional-features`, data);
    return response.data.data;
  },

  update: async (id: string, data: AdditionalFeature): Promise<void> => {
    await axios.put(`${API_URL}/additional-features/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/additional-features/${id}`);
  },
};
