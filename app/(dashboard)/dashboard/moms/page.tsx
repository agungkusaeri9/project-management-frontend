'use client';

import { FileText } from 'lucide-react';
import { MoMTable } from '@/features/mom/components/mom-table';

export default function MoMsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Minutes of Meeting
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage and track all project meeting records and attachments.
          </p>
        </div>
      </div>

      <MoMTable />
    </div>
  );
}
