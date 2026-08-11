'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Plus, Search, Edit2, Trash2, Loader2, Calendar, FileText, CheckCircle2, Circle, Clock, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAllAdditionalFeatures, useDeleteAdditionalFeature } from '../../../features/additional-feature/hooks/use-additional-features';
import { useProjects } from '../../../features/project/hooks/use-projects';

export default function AdditionalFeaturesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);
  
  const { data: allFeatures = [], isLoading: isFeaturesLoading } = useAllAdditionalFeatures();
  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { mutate: deleteFeature, isPending: isDeleting } = useDeleteAdditionalFeature();

  const getProjectName = (projectId: string) => {
    const project = projects?.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getCustomerName = (projectId: string) => {
    const project = projects?.find(p => p.id === projectId);
    return project?.customer_name || '-';
  };

  const filteredFeatures = useMemo(() => {
    const safe = allFeatures ?? [];
    if (!search.trim()) return safe;
    const lower = search.toLowerCase();
    
    return safe.filter((feature) => {
      const projectName = getProjectName(feature.project_id).toLowerCase();
      const customerName = getCustomerName(feature.project_id).toLowerCase();
      const codeStr = (feature.code || '').toLowerCase();
      
      return projectName.includes(lower) || customerName.includes(lower) || codeStr.includes(lower);
    });
  }, [allFeatures, search, projects]);

  const totalItems = (filteredFeatures ?? []).length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentFeatures = filteredFeatures.slice((page - 1) * limit, page * limit);

  const confirmDelete = (id: string) => {
    setFeatureToDelete(id);
  };

  const handleDelete = () => {
    if (!featureToDelete) return;
    
    deleteFeature(featureToDelete, {
      onSuccess: () => {
        toast.success('Additional feature deleted');
        setFeatureToDelete(null);
        if (currentFeatures.length === 1 && page > 1) {
          setPage(page - 1);
        }
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to delete');
        setFeatureToDelete(null);
      }
    });
  };

  const renderStatus = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
            <Clock className="w-3.5 h-3.5" />
            Ongoing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Circle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  const isLoading = isFeaturesLoading || isProjectsLoading;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Additional Features</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage additional features across all projects
          </p>
        </div>
        
        <Link
          href="/additional-features/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Code, Project..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Completion</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : currentFeatures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No additional features found</p>
                  </td>
                </tr>
              ) : (
                currentFeatures.map((feature) => (
                  <tr key={feature.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/additional-features/${feature.id}`}
                        className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {feature.code || 'N/A'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {getProjectName(feature.project_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {getCustomerName(feature.project_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatus(feature.status)}
                    </td>
                    <td className="px-6 py-4">
                      {feature.estimated_completion_date ? (
                        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(feature.estimated_completion_date), 'dd MMM yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {feature.created_at ? format(new Date(feature.created_at), 'dd MMM yyyy') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/additional-features/${feature.id}/edit`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(feature.id)}
                          disabled={isDeleting && featureToDelete === feature.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting && featureToDelete === feature.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
          <div className="text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-900 dark:text-white">
              {totalItems === 0 ? 0 : (page - 1) * limit + 1}
            </span> to <span className="font-medium text-slate-900 dark:text-white">
              {Math.min(page * limit, totalItems)}
            </span> of <span className="font-medium text-slate-900 dark:text-white">{totalItems}</span> results
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {featureToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Additional Feature</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this additional feature? All items, modules, and structures within it will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFeatureToDelete(null)}
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
