import api from '../../../lib/axios';

export interface IssueItem {
  id?: string;
  issue_id?: string;
  module_id: string | null;
  module_name?: string | null;
  feature_id: string | null;
  feature_name?: string | null;
  sub_feature_id: string | null;
  sub_feature_name?: string | null;
  description: string | null;
  status?: string;
}

export interface Issue {
  id: string;
  project_id: string | null;
  project_name: string | null;
  customer_id: string | null;
  customer_name: string | null;
  module_id: string | null;
  module_name: string | null;
  feature_id: string | null;
  feature_name: string | null;
  sub_feature_id: string | null;
  sub_feature_name: string | null;
  issue_code: string;
  title: string;
  description: string | null;
  issue_date: string | null;
  status: string;
  priority: string;
  created_by: string | null;
  items?: IssueItem[];
  created_at: string;
  updated_at: string;
}

export const issueService = {
  getAll: async (): Promise<Issue[]> => {
    const res = await api.get('/issues');
    return res.data.data;
  },
  getById: async (id: string): Promise<Issue> => {
    const res = await api.get(`/issues/${id}`);
    return res.data.data;
  },
  create: async (data: any): Promise<Issue> => {
    const res = await api.post('/issues', data);
    return res.data.data;
  },
  update: async (id: string, data: any): Promise<Issue> => {
    const res = await api.put(`/issues/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/issues/${id}`);
  },
};
