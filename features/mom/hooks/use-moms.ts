import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { momService, MoMFilter, CreateMoMPayload, UpdateMoMPayload } from '../services/mom.service';

export const useMoMs = (filter?: MoMFilter) => {
  return useQuery({
    queryKey: ['moms', filter],
    queryFn: () => momService.getAll(filter),
  });
};

export const useMoM = (id: string) => {
  return useQuery({
    queryKey: ['moms', id],
    queryFn: () => momService.getById(id),
    enabled: !!id,
  });
};

export const useCreateMoM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMoMPayload) => momService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moms'] });
    },
  });
};

export const useUpdateMoM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMoMPayload }) =>
      momService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['moms'] });
      queryClient.invalidateQueries({ queryKey: ['moms', variables.id] });
    },
  });
};

export const useDeleteMoM = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => momService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moms'] });
    },
  });
};

export const useUploadMoMFiles = () => {
  return useMutation({
    mutationFn: (files: File[]) => momService.uploadFiles(files),
  });
};
