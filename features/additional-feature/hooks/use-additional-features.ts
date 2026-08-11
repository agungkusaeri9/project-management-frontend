import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { additionalFeatureService, AdditionalFeature } from '../services/additional-feature.service';

export function useAllAdditionalFeatures() {
  return useQuery({
    queryKey: ['additional-features', 'all'],
    queryFn: () => additionalFeatureService.getAll(),
  });
}

export function useAdditionalFeatures(projectId: string) {
  return useQuery({
    queryKey: ['additional-features', projectId],
    queryFn: () => additionalFeatureService.getAllByProjectId(projectId),
    enabled: !!projectId,
  });
}

export function useAdditionalFeature(id: string) {
  return useQuery({
    queryKey: ['additional-feature', id],
    queryFn: () => additionalFeatureService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAdditionalFeature(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdditionalFeature) => additionalFeatureService.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-features', projectId] });
      queryClient.invalidateQueries({ queryKey: ['additional-features', 'all'] });
    },
  });
}

export function useCreateGlobalAdditionalFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdditionalFeature) => additionalFeatureService.create(data.project_id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['additional-features', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['additional-features', 'all'] });
    },
  });
}

export function useUpdateAdditionalFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdditionalFeature }) =>
      additionalFeatureService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['additional-feature', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['additional-features'] });
    },
  });
}

export function useDeleteAdditionalFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => additionalFeatureService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-features'] });
    },
  });
}
