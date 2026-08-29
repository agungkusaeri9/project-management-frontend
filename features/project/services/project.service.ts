import api from '../../../lib/axios';

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_by?: string | null;
  customer_id: string | null;
  customer_name?: string | null;
  created_at: string;
  updated_at: string;
}

export const projectService = {
  getAll: async () => {
    const response = await api.get<{ data: Project[] }>('/projects');
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: Project }>(`/projects/${id}`);
    return response.data.data;
  },

  create: async (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  exportExcel: async (id: string, projectName?: string) => {
    const response = await api.get(`/projects/${id}/export-excel`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (projectName || 'Project').replace(/[^a-zA-Z0-9_\-]/g, '_');
    link.setAttribute('download', `Project_${cleanName}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
