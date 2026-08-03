import api from '../../../lib/axios';
import { Project } from './project.service';

export interface ProjectMember {
  id?: string;
  project_id?: string;
  user_id: string;
  user_name?: string | null;
  username?: string | null;
  role: string;        // 'programmer' | 'sales'
  sub_role?: string | null; // 'frontend' | 'backend' | 'fullstack'
  is_pic: boolean;
  created_at?: string;
  updated_at?: string;
}

export const projectMemberService = {
  getByProjectId: async (projectId: string): Promise<ProjectMember[]> => {
    const res = await api.get(`/projects/${projectId}/members`);
    return res.data.data ?? [];
  },
  sync: async (projectId: string, members: Omit<ProjectMember, 'id' | 'project_id' | 'user_name' | 'username' | 'created_at' | 'updated_at'>[]): Promise<void> => {
    await api.put(`/projects/${projectId}/members`, members);
  },
};
