import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subFeatureService, SubFeature } from '../services/sub-feature.service';

export const useSubFeatures = (parentId: string) => {
  return useQuery({
    queryKey: ['sub-features', parentId],
    queryFn: () => subFeatureService.getByParentId(parentId),
    enabled: !!parentId,
  });
};

export const useCreateSubFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => subFeatureService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sub-features', variables.feature_id] });
    },
  });
};

export const useUpdateSubFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subFeatureService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sub-features', variables.data.feature_id] });
    },
  });
};

export const useDeleteSubFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; parentId: string }) => subFeatureService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sub-features', variables.parentId] });
    },
  });
};
