'use client';

import { ModuleTable } from '@/features/module/components/module-table';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProjectModulesPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/projects"
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Modules</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage modules for this project.
          </p>
        </div>
      </div>

      {/* Module Table with Inline Quick Add */}
      <ModuleTable projectId={projectId} />
    </div>
  );
}
