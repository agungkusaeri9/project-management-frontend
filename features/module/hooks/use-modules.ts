import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService, Module } from '../services/module.service';

export const useModules = (parentId: string) => {
  return useQuery({
    queryKey: ['modules', parentId],
    queryFn: () => moduleService.getByParentId(parentId),
    enabled: !!parentId,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => moduleService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modules', variables.project_id] });
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => moduleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modules', variables.data.project_id] });
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; parentId: string }) => moduleService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modules', variables.parentId] });
    },
  });
};
