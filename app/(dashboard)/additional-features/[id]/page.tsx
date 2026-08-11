'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft, Trash2, Zap, Calendar, Loader2, FolderOpen, Box, GitBranch, Layers, User, Hash, Clock, CheckCircle2, Circle, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdditionalFeature, useDeleteAdditionalFeature } from '../../../../features/additional-feature/hooks/use-additional-features';
import { useProject } from '../../../../features/project/hooks/use-projects';

export default function AdditionalFeatureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: feature, isLoading, isError } = useAdditionalFeature(id);
  const { data: project } = useProject(feature?.project_id || '');
  const { mutate: deleteFeature, isPending: isDeleting } = useDeleteAdditionalFeature();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !feature) {
    return (
      <div className="text-center py-20 text-slate-500">
        Additional Feature not found.
      </div>
    );
  }

  const handleDelete = () => {
    deleteFeature(id, {
      onSuccess: () => {
        toast.success('Additional features deleted');
        router.push(`/projects/${feature.project_id}`);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to delete');
        setShowDeleteModal(false);
      }
    });
  };

  const renderStatus = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
            <Clock className="w-4 h-4" />
            Ongoing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Circle className="w-4 h-4" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  Additional Feature Details
                  <span className="px-2.5 py-1 rounded-md text-sm font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-slate-400" />
                    {feature.code || 'N/A'}
                  </span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage the items and structure for this submission.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Entire Feature
          </button>
        </div>
      </div>

      {/* Info Card - Full Width */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Project Name</h3>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {project?.name || 'Loading...'}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4" /> Customer Info
            </h3>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {project?.customer_name || 'No Customer Attached'}
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Status</h3>
            <div>{renderStatus(feature.status)}</div>
          </div>

          <div className="col-span-1">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Start Date
            </h3>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {feature.start_date ? format(new Date(feature.start_date), 'dd MMMM yyyy') : '-'}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Estimated Completion Date
            </h3>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {feature.estimated_completion_date ? format(new Date(feature.estimated_completion_date), 'dd MMMM yyyy') : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Feature Items ({feature.items?.length || 0})</h2>
        </div>

        {(!feature.items || feature.items.length === 0) ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">No additional feature items found for this submission.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {feature.items.map((item, index) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                
                {/* Item Header */}
                <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-900">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black shadow-sm">
                          {index + 1}
                        </span>
                        {item.name}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed">
                        {item.description || 'No description provided.'}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Item Est. Completion</span>
                      <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                        <Calendar className="w-4 h-4" />
                        {item.estimated_completion_date ? format(new Date(item.estimated_completion_date), 'dd MMM yyyy') : 'No Date Set'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item Hierarchy */}
                <div className="p-6 md:p-8">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-6">
                    <GitBranch className="w-5 h-5 text-indigo-500" />
                    Structure Breakdown
                  </h3>

                  {(!item.modules || item.modules.length === 0) ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                      <p className="text-slate-500">No modules structure added to this item yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {item.modules.map((mod: any) => (
                        <div key={mod.id} className="border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/20 transition-colors hover:border-indigo-200 dark:hover:border-indigo-500/30">
                          <div className="bg-white/80 dark:bg-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                              <FolderOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{mod.name}</h4>
                          </div>
                          
                          {mod.features && mod.features.length > 0 ? (
                            <div className="p-5 space-y-5">
                              {mod.features.map((feat: any) => (
                                <div key={feat.id} className="pl-6 border-l-2 border-indigo-100 dark:border-indigo-900/50 relative">
                                  <div className="absolute w-4 h-0.5 bg-indigo-100 dark:bg-indigo-900/50 top-3 -left-0.5" />
                                  <div className="flex items-center gap-2 mb-3">
                                    <Box className="w-4 h-4 text-indigo-500" />
                                    <h5 className="font-bold text-slate-800 dark:text-slate-200">{feat.name}</h5>
                                  </div>
                                  
                                  {feat.sub_features && feat.sub_features.length > 0 && (
                                    <div className="pl-7 space-y-2.5 mt-2">
                                      {feat.sub_features.map((sub: any) => (
                                        <div key={sub.id} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 relative">
                                          <div className="absolute w-3 h-5 border-b-2 border-l-2 border-slate-200 dark:border-slate-700 rounded-bl -left-4 -top-3" />
                                          <Circle className="w-2 h-2 text-slate-400 fill-slate-400" />
                                          <span className="font-medium">{sub.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-sm text-slate-500 text-center italic">Empty module</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Entire Feature</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this additional feature? All items, modules, and structures within it will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete Feature'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
