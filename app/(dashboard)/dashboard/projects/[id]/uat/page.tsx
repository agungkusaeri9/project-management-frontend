'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckSquare, Plus, Sparkles, FileSpreadsheet,
  Search, Filter, CheckCircle2, XCircle, AlertCircle, Clock,
  Loader2, HelpCircle, Eye, Edit2, Trash2, History, ExternalLink,
  ChevronDown, Layers, Box, FolderOpen, RefreshCw
} from 'lucide-react';
import { useProject } from '@/features/project/hooks/use-projects';
import { useModules } from '@/features/module/hooks/use-modules';
import { useFeatures } from '@/features/feature/hooks/use-features';
import { useSubFeatures } from '@/features/subfeature/hooks/use-sub-features';
import { useUATTemplates } from '@/features/uat/hooks/use-uat-templates';
import {
  useUATTestCases,
  useUATStatistics,
  useCreateUATTestCase,
  useGenerateUATFromTemplates,
  useUpdateUATTestCase,
  useUpdateUATStatus,
  useDeleteUATTestCase,
  useUATExecutionLogs,
} from '@/features/uat/hooks/use-uats';
import { UATTestCase, uatService } from '@/features/uat/services/uat.service';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  passed: { label: 'Passed', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
  failed: { label: 'Failed', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-400', icon: XCircle },
  untested: { label: 'Untested', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: Clock },
  blocked: { label: 'Blocked', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-400', icon: AlertCircle },
  retest: { label: 'Retest', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-400', icon: RefreshCw },
};

export default function ProjectUATPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Project & Scope Data
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: modules = [] } = useModules(projectId);

  // Filters State
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const [selectedSubFeature, setSelectedSubFeature] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Dependent Feature & SubFeature hooks
  const { data: features = [] } = useFeatures(selectedModule !== 'all' ? selectedModule : '');
  const { data: subFeatures = [] } = useSubFeatures(selectedFeature !== 'all' ? selectedFeature : '');

  // UAT Test Cases & Stats
  const { data: testCases = [], isLoading: isLoadingUAT, refetch } = useUATTestCases({
    project_id: projectId,
    module_id: selectedModule !== 'all' ? selectedModule : undefined,
    feature_id: selectedFeature !== 'all' ? selectedFeature : undefined,
    sub_feature_id: selectedSubFeature !== 'all' ? selectedSubFeature : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    search: search || undefined,
  });

  const { data: stats } = useUATStatistics({
    project_id: projectId,
    module_id: selectedModule !== 'all' ? selectedModule : undefined,
    feature_id: selectedFeature !== 'all' ? selectedFeature : undefined,
    sub_feature_id: selectedSubFeature !== 'all' ? selectedSubFeature : undefined,
  });

  // Mutations
  const { mutate: generateUAT, isPending: isGenerating } = useGenerateUATFromTemplates();
  const { mutate: createTestCase, isPending: isCreating } = useCreateUATTestCase();
  const { mutate: updateTestCase, isPending: isUpdating } = useUpdateUATTestCase();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUATStatus();
  const { mutate: deleteTestCase } = useDeleteUATTestCase();

  // Modals State
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [executeModalTestCase, setExecuteModalTestCase] = useState<UATTestCase | null>(null);
  const [historyModalTestCaseId, setHistoryModalTestCaseId] = useState<string | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<UATTestCase | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Master Templates for Generator Modal
  const { data: masterTemplates = [] } = useUATTemplates(undefined, true);

  // Safe Arrays
  const safeModules = Array.isArray(modules) ? modules : [];
  const safeFeatures = Array.isArray(features) ? features : [];
  const safeSubFeatures = Array.isArray(subFeatures) ? subFeatures : [];
  const safeTestCases = Array.isArray(testCases) ? testCases : [];
  const safeMasterTemplates = Array.isArray(masterTemplates) ? masterTemplates : [];

  // ── Generator Form State ──
  const [genModuleId, setGenModuleId] = useState('');
  const [genFeatureId, setGenFeatureId] = useState('');
  const [genSubFeatureId, setGenSubFeatureId] = useState('');
  const [genEntityName, setGenEntityName] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  // Features and subfeatures for generator modal
  const { data: genFeatures = [] } = useFeatures(genModuleId);
  const { data: genSubFeatures = [] } = useSubFeatures(genFeatureId);

  const safeGenFeatures = Array.isArray(genFeatures) ? genFeatures : [];
  const safeGenSubFeatures = Array.isArray(genSubFeatures) ? genSubFeatures : [];

  // ── Manual Create / Edit Form State ──
  const [manualForm, setManualForm] = useState({
    module_id: '',
    feature_id: '',
    sub_feature_id: '',
    test_code: '',
    title: '',
    category: 'functional',
    pre_condition: '',
    test_steps: '',
    expected_result: '',
    severity: 'normal',
  });

  const { data: manualFeatures = [] } = useFeatures(manualForm.module_id);
  const { data: manualSubFeatures = [] } = useSubFeatures(manualForm.feature_id);

  const safeManualFeatures = Array.isArray(manualFeatures) ? manualFeatures : [];
  const safeManualSubFeatures = Array.isArray(manualSubFeatures) ? manualSubFeatures : [];

  // ── Execute Status Form State ──
  const [execStatus, setExecStatus] = useState<string>('passed');
  const [execActual, setExecActual] = useState<string>('');
  const [execNotes, setExecNotes] = useState<string>('');
  const [execEvidence, setExecEvidence] = useState<string>('');

  // History Logs Query
  const { data: historyLogs = [], isLoading: isLoadingLogs } = useUATExecutionLogs(historyModalTestCaseId || undefined);
  const safeHistoryLogs = Array.isArray(historyLogs) ? historyLogs : [];

  // Open Generator Modal Helper
  const handleOpenGenerate = () => {
    const defaultMod = safeModules[0]?.id || '';
    setGenModuleId(defaultMod);
    setGenFeatureId('');
    setGenSubFeatureId('');
    setGenEntityName('');
    setSelectedTemplateIds(safeMasterTemplates.map((t) => t.id)); // Default select all
    setGenerateModalOpen(true);
  };

  // Submit Generator
  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genModuleId || !genFeatureId) {
      toast.error('Pilih Modul dan Fitur terlebih dahulu');
      return;
    }
    if (selectedTemplateIds.length === 0) {
      toast.error('Pilih minimal 1 master template');
      return;
    }

    generateUAT(
      {
        project_id: projectId,
        module_id: genModuleId,
        feature_id: genFeatureId,
        sub_feature_id: genSubFeatureId || null,
        entity_name: genEntityName,
        template_ids: selectedTemplateIds,
      },
      {
        onSuccess: () => setGenerateModalOpen(false),
      }
    );
  };

  // Open Execute Modal
  const handleOpenExecute = (tc: UATTestCase) => {
    setExecuteModalTestCase(tc);
    setExecStatus(tc.status || 'passed');
    setExecActual(tc.actual_result || '');
    setExecNotes(tc.notes || '');
    setExecEvidence(tc.evidence_url || '');
  };

  // Submit Execute Status
  const handleExecuteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeModalTestCase) return;

    updateStatus(
      {
        id: executeModalTestCase.id,
        payload: {
          status: execStatus,
          actual_result: execActual,
          notes: execNotes,
          evidence_url: execEvidence,
        },
      },
      {
        onSuccess: () => setExecuteModalTestCase(null),
      }
    );
  };

  // Export Excel
  const handleExportExcel = async () => {
    if (!project) return;
    setIsExportingExcel(true);
    try {
      await uatService.exportExcel(projectId, project.code || project.name);
      toast.success('UAT Matrix berhasil diexport ke Excel!');
    } catch {
      toast.error('Gagal mengexport UAT Matrix');
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-20 text-slate-500">Project tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Kembali ke Detail Project"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                UAT & Testing Matrix
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono">
                {project.code}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola skenario pengujian, eksekusi test case, dan matriks validasi {project.name}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {isExportingExcel ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            <span>Export Matrix (.xlsx)</span>
          </button>

          <button
            onClick={handleOpenGenerate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate dari Master Template</span>
          </button>

          <button
            onClick={() => {
              setEditingTestCase(null);
              setManualForm({
                module_id: modules[0]?.id || '',
                feature_id: '',
                sub_feature_id: '',
                test_code: '',
                title: '',
                category: 'functional',
                pre_condition: '',
                test_steps: '',
                expected_result: '',
                severity: 'normal',
              });
              setManualModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Skenario</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats?.total || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Test Cases</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.passed || 0}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1 font-semibold">{stats?.pass_rate?.toFixed(1) || 0}% Pass Rate</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats?.failed || 0}</div>
          <div className="text-[11px] text-rose-500 mt-1">Perlu Perbaikan</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Untested
          </div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">{stats?.untested || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Belum Diuji</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Blocked
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats?.blocked || 0}</div>
          <div className="text-[11px] text-amber-500 mt-1">Terkendala Dependency</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Retest
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats?.retest || 0}</div>
          <div className="text-[11px] text-purple-500 mt-1">Uji Ulang</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode, skenario, langkah pengujian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setSelectedFeature('all');
                setSelectedSubFeature('all');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">Semua Modul</option>
              {safeModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Feature Filter */}
          <div>
            <select
              value={selectedFeature}
              onChange={(e) => {
                setSelectedFeature(e.target.value);
                setSelectedSubFeature('all');
              }}
              disabled={selectedModule === 'all'}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              <option value="all">Semua Fitur</option>
              {safeFeatures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">Semua Status</option>
              <option value="untested">Untested</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
              <option value="retest">Retest</option>
            </select>
          </div>
        </div>
      </div>

      {/* UAT Test Cases Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5 w-24">Test Code</th>
                <th className="px-4 py-3.5">Hierarki Fitur</th>
                <th className="px-4 py-3.5 min-w-64">Skenario Pengujian (Title)</th>
                <th className="px-4 py-3.5 min-w-64">Langkah & Ekspektasi</th>
                <th className="px-4 py-3.5 text-center w-32">Status</th>
                <th className="px-4 py-3.5">Tester & Bukti</th>
                <th className="px-4 py-3.5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoadingUAT ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : safeTestCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada test case UAT</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik tombol <strong>&quot;Generate dari Master Template&quot;</strong> di atas untuk membuat test case secara otomatis.
                    </p>
                  </td>
                </tr>
              ) : (
                safeTestCases.map((tc, idx) => {
                  const statusInfo = STATUS_CONFIG[tc.status] || STATUS_CONFIG.untested;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={tc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {tc.test_code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <FolderOpen className="w-3 h-3 text-indigo-500" />
                            {tc.module_name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Box className="w-2.5 h-2.5 text-slate-400" />
                            {tc.feature_name}
                            {tc.sub_feature_name && (
                              <>
                                <span className="text-slate-300 dark:text-slate-600">/</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                  {tc.sub_feature_name}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-normal max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                          {tc.title}
                        </div>
                        {tc.pre_condition && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                            Syarat: {tc.pre_condition}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-normal max-w-sm">
                        <div className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                          <strong>Langkah:</strong> {tc.test_steps}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                          <strong>Ekspektasi:</strong> {tc.expected_result}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenExecute(tc)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-transform hover:scale-105 cursor-pointer shadow-2xs ${statusInfo.bg} ${statusInfo.text}`}
                          title="Klik untuk Update Hasil Pengujian"
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusInfo.label}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {tc.tester_name || '-'}
                          </span>
                          {tc.evidence_url && (
                            <a
                              href={tc.evidence_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-0.5 text-[10px]"
                            >
                              <ExternalLink className="w-2.5 h-2.5" /> Bukti Test
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setHistoryModalTestCaseId(tc.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                            title="Riwayat Eksekusi UAT"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus test case ${tc.test_code}?`)) {
                                deleteTestCase(tc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                            title="Hapus Skenario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: GENERATE FROM MASTER TEMPLATES ── */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-xl my-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Generate UAT dari Master Template
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pilih target fitur/sub-fitur dan template yang ingin digenerate secara otomatis
                  </p>
                </div>
              </div>
              <button onClick={() => setGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              {/* Target Hierarchy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Modul *</label>
                  <select
                    value={genModuleId}
                    onChange={(e) => {
                      setGenModuleId(e.target.value);
                      setGenFeatureId('');
                      setGenSubFeatureId('');
                    }}
                    required
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">Pilih Modul...</option>
                    {safeModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Fitur *</label>
                  <select
                    value={genFeatureId}
                    onChange={(e) => {
                      const featId = e.target.value;
                      setGenFeatureId(featId);
                      setGenSubFeatureId('');
                      const feat = safeGenFeatures.find((f) => f.id === featId);
                      if (feat && !genEntityName) setGenEntityName(feat.name);
                    }}
                    required
                    disabled={!genModuleId}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  >
                    <option value="">Pilih Fitur...</option>
                    {safeGenFeatures.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Sub Fitur (Opsional)</label>
                  <select
                    value={genSubFeatureId}
                    onChange={(e) => {
                      const sfId = e.target.value;
                      setGenSubFeatureId(sfId);
                      const sf = safeGenSubFeatures.find((s) => s.id === sfId);
                      if (sf) setGenEntityName(sf.name);
                    }}
                    disabled={!genFeatureId}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  >
                    <option value="">(Langsung di Fitur)</option>
                    {safeGenSubFeatures.map((sf) => (
                      <option key={sf.id} value={sf.id}>
                        {sf.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Entity Name for Placeholder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Entitas Pengganti <code className="text-indigo-600 font-mono">{`{entity}`}</code> *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PPL List, Data Customer, Approval Cuti"
                  value={genEntityName}
                  onChange={(e) => setGenEntityName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Teks ini akan menggantikan variabel <code className="font-mono">{`{entity}`}</code> pada skenario template pengujian.
                </p>
              </div>

              {/* Template Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pilih Master Template ({selectedTemplateIds.length}/{safeMasterTemplates.length})
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateIds(safeMasterTemplates.map((t) => t.id))}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateIds([])}
                      className="text-slate-500 hover:underline"
                    >
                      Batal Pilih
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  {safeMasterTemplates.map((tmpl) => {
                    const isChecked = selectedTemplateIds.includes(tmpl.id);
                    return (
                      <label
                        key={tmpl.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTemplateIds([...selectedTemplateIds, tmpl.id]);
                            } else {
                              setSelectedTemplateIds(selectedTemplateIds.filter((id) => id !== tmpl.id));
                            }
                          }}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{tmpl.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{tmpl.code}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {tmpl.title_pattern.replace('{entity}', genEntityName || '...')}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || selectedTemplateIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Generate ({selectedTemplateIds.length}) Skenario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EXECUTE / UPDATE STATUS ── */}
      {executeModalTestCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {executeModalTestCase.test_code}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {executeModalTestCase.title}
                </h3>
              </div>
              <button onClick={() => setExecuteModalTestCase(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSubmit} className="space-y-4">
              {/* Status Radio Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Hasil Pengujian (Status) *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {['passed', 'failed', 'untested', 'blocked', 'retest'].map((st) => {
                    const info = STATUS_CONFIG[st];
                    const Icon = info.icon;
                    const isSelected = execStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setExecStatus(st)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? `${info.bg} ${info.text} border-current ring-2 ring-indigo-500/20`
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="capitalize">{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hasil Aktual / Temuan Tester
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Berhasil ditampilkan sesuai ekspektasi..."
                  value={execActual}
                  onChange={(e) => setExecActual(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Kendala / Feedback
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan untuk tim developer..."
                  value={execNotes}
                  onChange={(e) => setExecNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL Bukti Screenshot / Rekaman (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={execEvidence}
                  onChange={(e) => setExecEvidence(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setExecuteModalTestCase(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Hasil Pengujian</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EXECUTION HISTORY LOGS ── */}
      {historyModalTestCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                <span>Riwayat Eksekusi Pengujian</span>
              </h3>
              <button onClick={() => setHistoryModalTestCaseId(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {isLoadingLogs ? (
              <div className="py-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
              </div>
            ) : safeHistoryLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada riwayat pengujian tersimpan untuk test case ini.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {safeHistoryLogs.map((log) => {
                  const info = STATUS_CONFIG[log.status] || STATUS_CONFIG.untested;
                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Percobaan #{log.run_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${info.bg} ${info.text}`}>
                          {info.label}
                        </span>
                      </div>
                      {log.actual_result && (
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Temuan:</strong> {log.actual_result}
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-slate-500 italic">
                          <strong>Catatan:</strong> {log.notes}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                        <span>Tester: {log.tester_name || 'System'}</span>
                        <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHistoryModalTestCaseId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
