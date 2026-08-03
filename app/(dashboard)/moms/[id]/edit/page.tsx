'use client';

import { use } from 'react';
import { useMoM } from '../../../../../features/mom/hooks/use-moms';
import { MoMForm } from '../../../../../features/mom/components/mom-form';
import { Loader2, AlertCircle } from 'lucide-react';

interface EditMoMPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMoMPage({ params }: EditMoMPageProps) {
  const { id } = use(params);
  const { data: mom, isLoading, isError } = useMoM(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !mom) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-slate-600 dark:text-slate-400">MoM not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MoMForm momToEdit={mom} />
    </div>
  );
}
