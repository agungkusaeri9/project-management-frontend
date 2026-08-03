'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft, Layers, ChevronDown, ChevronRight as ChevronRightIcon,
  Loader2, Building2, Calendar, Hash, Info, FolderOpen, Box, GitBranch,
  Users, Star, Code2, Zap, Edit2
} from 'lucide-react';
import { useProject } from '../../../../features/project/hooks/use-projects';
import { useProjectMembers } from '../../../../features/project/hooks/use-project-members';
import { useModules } from '../../../../features/module/hooks/use-modules';
import { useFeatures } from '../../../../features/feature/hooks/use-features';
import { useSubFeatures } from '../../../../features/subfeature/hooks/use-sub-features';
import { Module } from '../../../../features/module/services/module.service';
import { Feature } from '../../../../features/feature/services/feature.service';
import { ProjectFilesSection } from '../../../../features/project/components/project-files-section';

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
  if (isLoading) return <div className="pl-12 py-2"><Loader2 className="w-4 h-4 animate-spin text-indigo-400" /></div>;
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 py-2 px-3 pl-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left"
      >
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        <Box className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{feature.name}</span>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${statusStyle(feature.status)}`}>
          {feature.status.replace('_', ' ')}
        </span>
      </button>
      {open && <SubFeatureItems featureId={feature.id} />}
    </div>
  );
}

// ── Module accordion row ────────────────────────────────────────
function ModuleRow({ module }: { module: Module }) {
  const [open, setOpen] = useState(false);
  const { data: features, isLoading } = useFeatures(module.id);
  const safeFeatures = features ?? [];

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <FolderOpen className="w-5 h-5 text-violet-500 flex-shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-slate-100">{module.name}</span>
        <span className="ml-2 text-xs text-slate-400">#{module.sort_order}</span>
        <span className="ml-auto text-xs text-slate-400">{safeFeatures.length} feature{safeFeatures.length !== 1 ? 's' : ''}</span>
        {open
          ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRightIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 py-2 space-y-0.5 bg-white dark:bg-slate-900/50">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
          ) : safeFeatures.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-3 pl-4">No features in this module.</p>
          ) : (
            safeFeatures.map((feature) => <FeatureRow key={feature.id} feature={feature} />)
          )}
        </div>
      )}
    </div>
  );
}

const roleLabel = (role: string, subRole?: string | null) => {
  if (role === 'programmer') {
    const sub = subRole ? subRole.charAt(0).toUpperCase() + subRole.slice(1) : 'Fullstack';
    return `Programmer (${sub})`;
  }
  if (role === 'electrical_engineer') {
    const map: Record<string, string> = {
      panel: 'Panel Wiring',
      plc: 'PLC Programming',
      hmi: 'HMI Design',
      commissioning: 'Commissioning',
      field: 'Field Installation',
    };
    const sub = subRole ? (map[subRole] || subRole) : 'Electrical';
    return `Electrical Engineer (${sub})`;
  }
  if (role === 'sales') {
    return 'Sales / Marketing';
  }
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
  const safeModules = modules ?? [];
  const safeMembers = members ?? [];

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
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
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
        <Link
          href={`/projects/${projectId}/modules`}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
        >
          <Layers className="w-4 h-4" />
          Manage Modules
        </Link>
      </div>

      {/* Project Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Project Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
              <Hash className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Project Code</dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{project.code}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
              <Building2 className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Customer</dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{project.customer_name || '—'}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Start Date</dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {project.start_date ? format(new Date(project.start_date), 'dd MMM yyyy') : '—'}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">End Date</dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {project.end_date ? format(new Date(project.end_date), 'dd MMM yyyy') : '—'}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created At</dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {format(new Date(project.created_at), 'dd MMM yyyy')}
              </dd>
            </div>
          </div>

          {project.description && (
            <div className="sm:col-span-2 flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                <Info className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">{project.description}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      {/* Team Members Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Project Team Members</h2>
          </div>
          <Link
            href={`/projects/${projectId}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Team
          </Link>
        </div>

        {isLoadingMembers ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : safeMembers.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-2">No team members assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {safeMembers.map((member) => (
              <div
                key={member.id || member.user_id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {member.user_name || member.username || 'User'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {roleLabel(member.role, member.sub_role)}
                  </div>
                </div>
                {member.is_pic && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    PIC
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Files */}
      <ProjectFilesSection projectId={projectId} />

      {/* Module Hierarchy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Module Hierarchy
            </h2>
          </div>
          <span className="text-sm text-slate-400">{safeModules.length} module{safeModules.length !== 1 ? 's' : ''}</span>
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
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Layers className="w-4 h-4" />
                Go to Module Management
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {safeModules.map((module) => (
                <ModuleRow key={module.id} module={module} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
