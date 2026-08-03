import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureService, Feature } from '../services/feature.service';

export const useFeatures = (parentId: string) => {
  return useQuery({
    queryKey: ['features', parentId],
    queryFn: () => featureService.getByParentId(parentId),
    enabled: !!parentId,
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => featureService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['features', variables.module_id] });
    },
  });
};

export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => featureService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['features', variables.data.module_id] });
    },
  });
};

export const useDeleteFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; parentId: string }) => featureService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['features', variables.parentId] });
    },
  });
};
