import api from '@/lib/axios';

export interface FileStorageItem {
  id: string;
  display_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  extension: string | null;
  category: string;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileStats {
  total_files: number;
  total_size_bytes: number;
  total_size_formatted: string;
  category_counts: Record<string, number>;
}

export interface FilesResponse {
  data: FileStorageItem[];
  total: number;
  page: number;
  limit: number;
}

export const fileService = {
  async getFiles(params?: {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<FilesResponse> {
    const res = await api.get<FilesResponse>('/files', { params });
    return res.data;
  },

  async getCategories(): Promise<string[]> {
    const res = await api.get<{ data: string[] }>('/files/categories');
    return res.data.data || [];
  },

  async getStats(): Promise<FileStats> {
    const res = await api.get<{ data: FileStats }>('/files/stats');
    return res.data.data;
  },

  async getFileByID(id: string): Promise<FileStorageItem> {
    const res = await api.get<{ data: FileStorageItem }>(`/files/${id}`);
    return res.data.data;
  },

  async uploadFile(formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<FileStorageItem> {
    const res = await api.post<{ data: FileStorageItem }>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return res.data.data;
  },

  async updateFile(id: string, payload: { display_name: string; category: string; description?: string }): Promise<void> {
    await api.put(`/files/${id}`, payload);
  },

  async deleteFile(id: string): Promise<void> {
    await api.delete(`/files/${id}`);
  },

  getDownloadUrl(id: string): string {
    const baseURL = api.defaults.baseURL || '';
    return `${baseURL}/files/${id}/download`;
  },

  getViewUrl(filePath: string): string {
    const baseURL = api.defaults.baseURL || '';
    return `${baseURL}${filePath}`;
  },
};
