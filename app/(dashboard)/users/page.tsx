'use client';

import { UserTable } from '../../../features/user/components/user-table';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage system users and assigned roles.
          </p>
        </div>
      </div>

      <UserTable />
    </div>
  );
}
