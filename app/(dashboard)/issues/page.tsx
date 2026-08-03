'use client';

import { IssueTable } from '../../../features/issue/components/issue-table';
import { AlertCircle } from 'lucide-react';

export default function IssuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Issue Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Track and manage project issues, bugs, and tasks.
          </p>
        </div>
      </div>

      <IssueTable />
    </div>
  );
}
