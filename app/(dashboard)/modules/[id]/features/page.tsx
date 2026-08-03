'use client';

import { FeatureTable } from '../../../../../features/feature/components/feature-table';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function ModuleFeaturesPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Module Features</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage features for this module.
          </p>
        </div>
      </div>

      <FeatureTable moduleId={moduleId} />
    </div>
  );
}
