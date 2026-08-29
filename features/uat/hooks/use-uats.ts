import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uatService,
  UATTestCase,
  GenerateUATPayload,
  UpdateUATStatusPayload,
  UATFilterParams,
} from '../services/uat.service';
import { toast } from 'sonner';

export const UAT_TEST_CASES_KEY = 'uat-test-cases';
export const UAT_STATS_KEY = 'uat-statistics';
export const UAT_LOGS_KEY = 'uat-logs';

export function useUATTestCases(params: UATFilterParams) {
  return useQuery({
    queryKey: [UAT_TEST_CASES_KEY, params],
    queryFn: () => uatService.getTestCases(params),
    enabled: !!params.project_id,
  });
}

export function useUATStatistics(params: {
  project_id?: string;
  module_id?: string;
  feature_id?: string;
  sub_feature_id?: string;
}) {
  return useQuery({
    queryKey: [UAT_STATS_KEY, params],
    queryFn: () => uatService.getStatistics(params),
    enabled: !!params.project_id,
  });
}

export function useUATTestCase(id?: string) {
  return useQuery({
    queryKey: [UAT_TEST_CASES_KEY, id],
    queryFn: () => uatService.getTestCaseById(id!),
    enabled: !!id,
  });
}

export function useUATExecutionLogs(testCaseId?: string) {
  return useQuery({
    queryKey: [UAT_LOGS_KEY, testCaseId],
    queryFn: () => uatService.getExecutionLogs(testCaseId!),
    enabled: !!testCaseId,
  });
}

export function useCreateUATTestCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UATTestCase>) => uatService.createTestCase(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [UAT_TEST_CASES_KEY] });
      queryClient.invalidateQueries({ queryKey: [UAT_STATS_KEY] });
      toast.success('UAT Test Case berhasil ditambahkan!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Gagal menambahkan UAT Test Case');
    },
  });
}

export function useGenerateUATFromTemplates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateUATPayload) => uatService.generateFromTemplates(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [UAT_TEST_CASES_KEY] });
      queryClient.invalidateQueries({ queryKey: [UAT_STATS_KEY] });
      toast.success(`Berhasil membuat ${data.length} UAT Test Case dari template!`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Gagal men-generate UAT dari template');
    },
  });
}

export function useUpdateUATTestCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UATTestCase> }) =>
      uatService.updateTestCase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UAT_TEST_CASES_KEY] });
      queryClient.invalidateQueries({ queryKey: [UAT_STATS_KEY] });
      toast.success('UAT Test Case berhasil diperbarui!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Gagal memperbarui UAT Test Case');
    },
  });
}

export function useUpdateUATStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUATStatusPayload }) =>
      uatService.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UAT_TEST_CASES_KEY] });
      queryClient.invalidateQueries({ queryKey: [UAT_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UAT_LOGS_KEY] });
      toast.success('Status pengujian berhasil disimpan!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Gagal memperbarui status pengujian');
    },
  });
}

export function useDeleteUATTestCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uatService.deleteTestCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UAT_TEST_CASES_KEY] });
      queryClient.invalidateQueries({ queryKey: [UAT_STATS_KEY] });
      toast.success('UAT Test Case berhasil dihapus!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.message || 'Gagal menghapus UAT Test Case');
    },
  });
}
