'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft, Layers, ChevronDown, ChevronRight as ChevronRightIcon,
  Loader2, Building2, Calendar, Hash, Info, FolderOpen, Box, GitBranch,
  Users, Star, Code2, Zap, Edit2, Plus, Printer, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '../../../../features/project/hooks/use-projects';
import { useProjectMembers } from '../../../../features/project/hooks/use-project-members';
import { useModules } from '../../../../features/module/hooks/use-modules';
import { useFeatures } from '../../../../features/feature/hooks/use-features';
import { useSubFeatures } from '../../../../features/subfeature/hooks/use-sub-features';
import { Module } from '../../../../features/module/services/module.service';
import { Feature } from '../../../../features/feature/services/feature.service';
import { ProjectFilesSection } from '../../../../features/project/components/project-files-section';
import { useAdditionalFeatures } from '../../../../features/additional-feature/hooks/use-additional-features';

// ── Status badge helper ─────────────────────────────────────────
const statusStyle = (status: string) => {
  switch (status) {
    case 'ongoing':
    case 'in_progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'completed':
    case 'done': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'on-hold':
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }
};

// ── Sub-Feature list (leaf) ─────────────────────────────────────
function SubFeatureItems({ featureId }: { featureId: string }) {
  const { data: subFeatures, isLoading } = useSubFeatures(featureId);
  const safe = subFeatures ?? [];
  if (isLoading) return <div className="pl-12 py-2 print:py-1"><Loader2 className="w-4 h-4 animate-spin text-indigo-400 print:hidden" /></div>;
  if (safe.length === 0) return <div className="pl-12 py-2 text-xs text-slate-400 italic">No sub-features</div>;
  return (
    <ul className="pl-12 py-1 space-y-0.5">
      {safe.map((sf) => (
        <li key={sf.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
          <GitBranch className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-700 dark:text-slate-300">{sf.name}</span>
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${statusStyle(sf.status)}`}>
            {sf.status.replace('_', ' ')}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Feature accordion row ───────────────────────────────────────
function FeatureRow({ feature }: { feature: Feature }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
      >
        <span className="text-slate-400 print:hidden">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </span>
        <Box className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{feature.name}</span>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${statusStyle(feature.status)}`}>
          {feature.status.replace('_', ' ')}
        </span>
      </div>
      {open && <SubFeatureItems featureId={feature.id} />}
    </div>
  );
}

// ── Module accordion card ───────────────────────────────────────
function ModuleCard({ module }: { module: Module }) {
  const [open, setOpen] = useState(false);
  const { data: features, isLoading } = useFeatures(module.id);
  const safeFeatures = features ?? [];

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 print:border-slate-300 print:shadow-none">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-800"
      >
        <span className="text-slate-400 print:hidden">
          {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
        </span>
        <FolderOpen className="w-5 h-5 text-indigo-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{module.name}</h3>
          {module.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{module.description}</p>
          )}
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex-shrink-0">
          {safeFeatures.length} features
        </span>
      </div>

      {open && (
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 print:hidden">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            </div>
          ) : safeFeatures.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 text-center">No features in this module</p>
          ) : (
            safeFeatures.map((f) => <FeatureRow key={f.id} feature={f} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── Role Label Helper ──────────────────────────────────────────
const roleLabel = (role: string) => {
  if (role === 'sales') return 'Sales / Marketing';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// ── Main Page ───────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading: isLoadingProject, isError } = useProject(projectId);
  const { data: members, isLoading: isLoadingMembers } = useProjectMembers(projectId);
  const { data: modules, isLoading: isLoadingModules } = useModules(projectId);
  const { data: additionalFeatures, isLoading: isLoadingAdditional } = useAdditionalFeatures(projectId);
  
  const safeModules = modules?.filter(m => !m.is_additional) ?? [];
  const safeMembers = members ?? [];
  const safeAdditional = additionalFeatures ?? [];

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/export-pdf`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.code || 'project'}-export.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export PDF berhasil!');
    } catch {
      toast.error('Gagal export PDF project');
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="text-center py-20 text-slate-500">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 print:p-0 print:m-0 print:space-y-4">
      {/* Print CSS Rules */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, nav, sidebar, .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:border-slate-300 {
            border-color: #cbd5e1 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 print:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{project.name}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${statusStyle(project.status)}`}>
              {project.status}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{project.code}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 print:hidden">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Export PDF
          </button>
          <Link
            href={`/projects/${projectId}/modules`}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Layers className="w-4 h-4" />
            Manage Modules
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
        {/* Project Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-full print:border-slate-300 print:shadow-none">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Project Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 print:hidden">
                <Hash className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-xs text-slate-400">Project Code</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">{project.code}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 print:hidden">
                <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-xs text-slate-400">Customer</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                  {project.customer_name || '-'}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 print:hidden">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-xs text-slate-400">Start Date</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                  {project.start_date ? format(new Date(project.start_date), 'dd MMM yyyy') : '-'}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 print:hidden">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-xs text-slate-400">End Date</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                  {project.end_date ? format(new Date(project.end_date), 'dd MMM yyyy') : '-'}
                </dd>
              </div>
            </div>

            {project.description && (
              <div className="sm:col-span-2 flex items-start gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 print:hidden">
                  <Info className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Description</dt>
                  <dd className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {project.description}
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </div>

        {/* Team Members Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-full print:border-slate-300 print:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Team Members</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {safeMembers.length} members
            </span>
          </div>

          {isLoadingMembers ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : safeMembers.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-6 text-center">No team members assigned.</p>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-64 pr-1">
              {safeMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {m.user_name ? m.user_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {m.user_name || m.username || 'Unknown'}
                        </p>
                        {m.is_pic && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> PIC
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{roleLabel(m.role)}</p>
                    </div>
                  </div>

                  {m.sub_role && (
                    <span className="px-2 py-0.5 rounded-md text-xs bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                      {m.sub_role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modules & Features Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-6 print:border-slate-300 print:shadow-none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Modules & Features</h2>
          </div>
          <Link
            href={`/projects/${projectId}/modules`}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium print:hidden"
          >
            Manage Modules →
          </Link>
        </div>

        <div className="p-6">
          {isLoadingModules ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : safeModules.length === 0 ? (
            <div className="text-center py-10">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No modules yet.</p>
              <Link
                href={`/projects/${projectId}/modules`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline print:hidden"
              >
                <Layers className="w-4 h-4" />
                Go to Module Management
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {safeModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Features */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-6 print:border-slate-300 print:shadow-none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Additional Features</h2>
          </div>
        </div>

        <div className="p-6">
          {isLoadingAdditional ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : safeAdditional.length === 0 ? (
            <div className="text-center py-10">
              <Zap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No additional features defined.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
              {safeAdditional.map((af) => (
                <Link
                  key={af.id}
                  href={`/additional-features/${af.id}`}
                  className="group flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {af.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      Additional
                    </span>
                  </div>
                  {af.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                      {af.description}
                    </p>
                  )}
                  {af.estimated_completion_date && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                      <Calendar className="w-3.5 h-3.5" />
                      Est. Completion: {format(new Date(af.estimated_completion_date), 'dd MMM yyyy')}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
