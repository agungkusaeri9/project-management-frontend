import api from '../../../lib/axios';

export interface MoMFile {
  id?: string;
  mom_id?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type?: string;
  created_at?: string;
}

export interface MoM {
  id: string;
  project_id: string;
  project_name?: string;
  project_code?: string;
  title: string;
  meeting_date: string;
  location?: string | null;
  attendees?: string | null;
  description?: string | null;
  long_description?: string | null;
  created_by?: string | null;
  files?: MoMFile[];
  created_at: string;
  updated_at: string;
}

export interface MoMFilter {
  project_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface CreateMoMPayload {
  project_id: string;
  title: string;
  meeting_date: string;
  location?: string | null;
  attendees?: string | null;
  description?: string | null;
  long_description?: string | null;
  created_by?: string | null;
  files?: Omit<MoMFile, 'id' | 'mom_id' | 'created_at'>[];
}

export interface UpdateMoMPayload extends CreateMoMPayload {
  new_files?: Omit<MoMFile, 'id' | 'mom_id' | 'created_at'>[];
  delete_file_ids?: string[];
}

export const momService = {
  getAll: async (filter?: MoMFilter): Promise<MoM[]> => {
    const params: Record<string, string> = {};
    if (filter?.project_id) params.project_id = filter.project_id;
    if (filter?.start_date) params.start_date = filter.start_date;
    if (filter?.end_date) params.end_date = filter.end_date;
    if (filter?.search) params.search = filter.search;
    const res = await api.get('/moms', { params });
    return res.data.data ?? [];
  },

  getById: async (id: string): Promise<MoM> => {
    const res = await api.get(`/moms/${id}`);
    return res.data.data;
  },

  create: async (data: CreateMoMPayload): Promise<MoM> => {
    const res = await api.post('/moms', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateMoMPayload): Promise<MoM> => {
    const res = await api.put(`/moms/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/moms/${id}`);
  },

  uploadFiles: async (files: File[]): Promise<MoMFile[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await api.post('/moms/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data ?? [];
  },
};
