import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueService, Issue } from '../services/issue.service';

export const useIssues = () => {
  return useQuery({
    queryKey: ['issues'],
    queryFn: () => issueService.getAll(),
  });
};

export const useIssue = (id: string) => {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: () => issueService.getById(id),
    enabled: !!id,
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => issueService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => issueService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', variables.id] });
    },
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => issueService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};
