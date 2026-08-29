import api from '@/lib/axios';

export interface MasterUATTemplate {
  id: string;
  code: string;
  name: string;
  category: string;
  action_type: string;
  title_pattern: string;
  pre_condition_pattern: string | null;
  test_steps_pattern: string;
  expected_result_pattern: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UATTestCase {
  id: string;
  project_id: string;
  module_id: string;
  feature_id: string;
  sub_feature_id: string | null;
  template_id: string | null;
  test_code: string;
  category: string;
  title: string;
  pre_condition: string | null;
  test_steps: string;
  expected_result: string;
  actual_result: string | null;
  status: 'untested' | 'passed' | 'failed' | 'blocked' | 'retest' | string;
  severity: 'critical' | 'major' | 'normal' | 'minor' | 'low' | string;
  tested_by: string | null;
  tested_at: string | null;
  notes: string | null;
  evidence_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;

  // Joined fields
  module_name?: string;
  feature_name?: string;
  sub_feature_name?: string;
  tester_name?: string;
}

export interface UATStatistics {
  total: number;
  untested: number;
  passed: number;
  failed: number;
  blocked: number;
  retest: number;
  pass_rate: number;
}

export interface UATExecutionLog {
  id: string;
  uat_test_case_id: string;
  run_number: number;
  status: string;
  actual_result: string | null;
  notes: string | null;
  evidence_url: string | null;
  tested_by: string | null;
  tester_name?: string;
  created_at: string;
}

export interface GenerateUATPayload {
  project_id: string;
  module_id: string;
  feature_id: string;
  sub_feature_id?: string | null;
  entity_name?: string;
  template_ids: string[];
}

export interface UpdateUATStatusPayload {
  status: string;
  actual_result?: string;
  notes?: string;
  evidence_url?: string;
  tester_id?: string;
}

export interface UATFilterParams {
  project_id?: string;
  module_id?: string;
  feature_id?: string;
  sub_feature_id?: string;
  status?: string;
  category?: string;
  search?: string;
}

export const uatService = {
  // ── Master UAT Templates ──
  async getTemplates(category?: string, activeOnly: boolean = false): Promise<MasterUATTemplate[]> {
    const res = await api.get<{ data: MasterUATTemplate[] }>('/master-uat-templates', {
      params: { category, active_only: activeOnly ? 'true' : 'false' },
    });
    return res.data.data ?? [];
  },

  async getTemplateById(id: string): Promise<MasterUATTemplate> {
    const res = await api.get<{ data: MasterUATTemplate }>(`/master-uat-templates/${id}`);
    return res.data.data;
  },

  async createTemplate(data: Partial<MasterUATTemplate>): Promise<MasterUATTemplate> {
    const res = await api.post<{ data: MasterUATTemplate }>('/master-uat-templates', data);
    return res.data.data;
  },

  async updateTemplate(id: string, data: Partial<MasterUATTemplate>): Promise<MasterUATTemplate> {
    const res = await api.put<{ data: MasterUATTemplate }>(`/master-uat-templates/${id}`, data);
    return res.data.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/master-uat-templates/${id}`);
  },

  // ── UAT Test Cases ──
  async getTestCases(params: UATFilterParams): Promise<UATTestCase[]> {
    const res = await api.get<{ data: UATTestCase[] }>('/uat-test-cases', { params });
    return res.data.data ?? [];
  },

  async getTestCaseById(id: string): Promise<UATTestCase> {
    const res = await api.get<{ data: UATTestCase }>(`/uat-test-cases/${id}`);
    return res.data.data;
  },

  async getStatistics(params: { project_id?: string; module_id?: string; feature_id?: string; sub_feature_id?: string }): Promise<UATStatistics> {
    const res = await api.get<{ data: UATStatistics }>('/uat-test-cases/statistics', { params });
    return res.data.data || { total: 0, untested: 0, passed: 0, failed: 0, blocked: 0, retest: 0, pass_rate: 0 };
  },

  async createTestCase(data: Partial<UATTestCase>): Promise<UATTestCase> {
    const res = await api.post<{ data: UATTestCase }>('/uat-test-cases', data);
    return res.data.data;
  },

  async generateFromTemplates(payload: GenerateUATPayload): Promise<UATTestCase[]> {
    const res = await api.post<{ data: UATTestCase[] }>('/uat-test-cases/generate', payload);
    return res.data.data ?? [];
  },

  async updateTestCase(id: string, data: Partial<UATTestCase>): Promise<UATTestCase> {
    const res = await api.put<{ data: UATTestCase }>(`/uat-test-cases/${id}`, data);
    return res.data.data;
  },

  async updateStatus(id: string, payload: UpdateUATStatusPayload): Promise<void> {
    await api.patch(`/uat-test-cases/${id}/status`, payload);
  },

  async deleteTestCase(id: string): Promise<void> {
    await api.delete(`/uat-test-cases/${id}`);
  },

  async getExecutionLogs(testCaseId: string): Promise<UATExecutionLog[]> {
    const res = await api.get<{ data: UATExecutionLog[] }>(`/uat-test-cases/${testCaseId}/logs`);
    return res.data.data ?? [];
  },

  async exportExcel(projectId: string, projectCode?: string): Promise<void> {
    const response = await api.get('/uat-test-cases/export-excel', {
      params: { project_id: projectId },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanCode = (projectCode || 'Project').replace(/[^a-zA-Z0-9_\-]/g, '_');
    link.setAttribute('download', `UAT_Matrix_${cleanCode}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
