import api from '../../../lib/axios';

export interface UserProjectProgress {
  user_id: string;
  user_name: string;
  username: string;
  role: string;
  completed_projects: number;
  uncompleted_projects: number;
}

export interface MonthlyProjectStat {
  month: string;
  total_projects: number;
  completed: number;
  ongoing: number;
}

export interface ProjectFeatureProgress {
  project_id: string;
  project_code: string;
  project_name: string;
  customer_name?: string | null;
  status: string;
  total_features: number;
  done_features: number;
  in_progress_features: number;
  new_features: number;
  cancelled_features: number;
  progress_percentage: number;
}

export interface DashboardSummary {
  open_issues_count: number;
  ongoing_projects_count: number;
  completed_projects_count: number;
  user_progress: UserProjectProgress[];
  monthly_stats: MonthlyProjectStat[];
  ongoing_projects: ProjectFeatureProgress[];
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get('/dashboard/summary');
    return res.data.data;
  },
};
