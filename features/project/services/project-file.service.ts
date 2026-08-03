import api from '../../../lib/axios';

export interface ProjectFile {
  id: string;
  project_id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type?: string | null;
  created_at: string;
}

export const projectFileService = {
  getByProjectId: async (projectId: string): Promise<ProjectFile[]> => {
    const res = await api.get(`/projects/${projectId}/files`);
    return res.data.data ?? [];
  },

  upload: async (projectId: string, title: string, files: File[]): Promise<ProjectFile[]> => {
    const formData = new FormData();
    formData.append('title', title);
    files.forEach((file) => formData.append('files', file));

    const res = await api.post(`/projects/${projectId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data ?? [];
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/project-files/${id}`);
  },
};
