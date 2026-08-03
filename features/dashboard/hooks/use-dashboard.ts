import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export type { UserProjectProgress, ProjectFeatureProgress, MonthlyProjectStat, DashboardSummary } from '../services/dashboard.service';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary(),
    refetchInterval: 30000,
  });
};
