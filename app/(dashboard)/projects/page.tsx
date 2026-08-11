'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProjectTable } from '../../../features/project/components/project-table';
import { ImportProjectModal } from '../../../features/project/components/import-project-modal';
import { Plus, Briefcase, FileSpreadsheet } from 'lucide-react';

export default function ProjectsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Projects Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your company projects and track their status.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-sm shadow-emerald-500/20 w-full sm:w-auto text-sm flex-shrink-0"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Import Project
          </button>
          <Link
            href="/projects/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/20 w-full sm:w-auto text-sm flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </Link>
        </div>
      </div>

      <ProjectTable />

      <ImportProjectModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
