'use client';

import { useState, useMemo } from 'react';
import { useMoMs, useDeleteMoM } from '../hooks/use-moms';
import { useProjects } from '../../project/hooks/use-projects';
import { MoM } from '../services/mom.service';
import {
  Search, Loader2, ChevronLeft, ChevronRight,
  Edit2, Trash2, Plus, FileText, Eye, Filter,
  Calendar, Paperclip, X
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function MoMTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [projectFilter, setProjectFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [momToDelete, setMomToDelete] = useState<MoM | null>(null);

  const filter = useMemo(() => ({
    project_id: projectFilter || undefined,
    start_date: startDate || undefined,
    search: search || undefined,
  }), [projectFilter, startDate, search]);

  const { data: moms = [], isLoading, isError } = useMoMs(filter);
  const { data: projects = [] } = useProjects();
  const { mutate: deleteMoM, isPending: isDeleting } = useDeleteMoM();

  const totalItems = moms.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentMoMs = moms.slice((page - 1) * limit, page * limit);

  const handleDelete = () => {
    if (!momToDelete) return;
    deleteMoM(momToDelete.id, {
      onSuccess: () => {
        toast.success('MoM deleted successfully');
        setMomToDelete(null);
      },
      onError: () => toast.error('Failed to delete MoM'),
    });
  };

  const clearFilters = () => {
    setSearch('');
    setProjectFilter('');
    setStartDate('');
    setPage(1);
  };

  const hasFilters = search || projectFilter || startDate;

  return (
    <>
      {/* Delete Confirmation Modal */}
      {momToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Delete MoM</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">
              Are you sure you want to delete <strong>"{momToDelete.title}"</strong>?
              All associated files will also be removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMomToDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search title, location..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Project Filter */}
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={projectFilter}
                  onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
                  className="pl-7 pr-8 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 appearance-none cursor-pointer"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}{p.customer_name ? ` — ${p.customer_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="pl-7 pr-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  title="Filter from date"
                />
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="p-2 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Clear filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Add Button */}
              <Link
                href="/dashboard/moms/create"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New MoM
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-20 text-red-500 text-sm">
              Failed to load minutes of meetings.
            </div>
          ) : currentMoMs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No minutes of meetings found</p>
              <Link
                href="/dashboard/moms/create"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Create your first MoM
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">#</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Project</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Meeting Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Files</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Created By</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentMoMs.map((mom, idx) => (
                  <tr key={mom.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono text-xs">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1 max-w-[200px]">
                          {mom.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {mom.project_code || mom.project_name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {mom.meeting_date
                        ? format(new Date(mom.meeting_date), 'dd MMM yyyy')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[150px]">
                      <span className="line-clamp-1">{mom.location || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {mom.files && mom.files.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                          <Paperclip className="w-3 h-3" />
                          {mom.files.length} file{mom.files.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {mom.created_by || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/moms/${mom.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/moms/${mom.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setMomToDelete(mom)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)} of {totalItems}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
