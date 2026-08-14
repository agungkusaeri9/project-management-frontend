import api from '@/lib/axios';

export interface SystemConfig {
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

export interface JiraConfigResponse {
  host: string;
  email: string;
  project_key: string;
  jql: string;
  auto_sync: string;
  has_token: boolean;
  masked_api_token: string;
}

export interface SaveJiraConfigPayload {
  host: string;
  email: string;
  api_token?: string;
  project_key?: string;
  jql?: string;
  auto_sync?: string;
}

export const configService = {
  getAll: async (): Promise<SystemConfig[]> => {
    const response = await api.get('/configs');
    return response.data.data || [];
  },

  getByKey: async (key: string): Promise<string> => {
    const response = await api.get(`/configs/${key}`);
    return response.data.data?.value || '';
  },

  set: async (key: string, value: string, description?: string): Promise<void> => {
    await api.post('/configs', { key, value, description });
  },

  setMultiple: async (configs: Record<string, string>): Promise<void> => {
    await api.post('/configs/bulk', configs);
  },

  getJiraConfig: async (): Promise<JiraConfigResponse> => {
    const response = await api.get('/configs/jira');
    return response.data.data;
  },

  saveJiraConfig: async (payload: SaveJiraConfigPayload): Promise<void> => {
    await api.post('/configs/jira', payload);
  },
};
