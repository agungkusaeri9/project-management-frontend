import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uatService, MasterUATTemplate } from '../services/uat.service';
import { toast } from 'sonner';

export const UAT_TEMPLATES_KEY = 'master-uat-templates';

export function useUATTemplates(category?: string, activeOnly: boolean = false) {
  return useQuery({
    queryKey: [UAT_TEMPLATES_KEY, category, activeOnly],
    queryFn: () => uatService.getTemplates(category, activeOnly),
  });
}

export function useUATTemplate(id?: string) {
  return useQuery({
    queryKey: [UAT_TEMPLATES_KEY, id],
    queryFn: () => uatService.getTemplateById(id!),
    enabled: !!id,
  });
}

export function useCreateUATTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MasterUATTemplate>) => uatService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UAT_TEMPLATES_KEY] });
      toast.success('Master template UAT berhasil dibuat!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Gagal membuat template UAT');
    },
  });
}

export function useUpdateUATTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MasterUATTemplate> }) =>
      uatService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UAT_TEMPLATES_KEY] });
      toast.success('Master template UAT berhasil diperbarui!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Gagal memperbarui template UAT');
    },
  });
}

export function useDeleteUATTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uatService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UAT_TEMPLATES_KEY] });
      toast.success('Master template UAT berhasil dihapus!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Gagal menghapus template UAT');
    },
  });
}
