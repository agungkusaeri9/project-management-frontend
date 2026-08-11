'use client';

import { useState, useMemo } from 'react';
import { Issue } from '../services/issue.service';
import { useIssues, useDeleteIssue } from '../hooks/use-issues';
import { Search, Loader2, ChevronLeft, ChevronRight, Edit2, Trash2, Plus, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { IssueFormModal } from './issue-form-modal';

const statusStyle = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'resolved':
    case 'closed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    default:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }
};

const priorityStyle = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-semibold';
    case 'high':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

export function IssueTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);
  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: allIssues = [], isLoading, isError } = useIssues();
  const { mutate: deleteIssue, isPending: isDeleting } = useDeleteIssue();

  const filteredIssues = useMemo(() => {
    const safe = allIssues ?? [];
    if (!search.trim()) return safe;
    const lower = search.toLowerCase();
    return safe.filter(
      (i) =>
        (i.issue_code && i.issue_code.toLowerCase().includes(lower)) ||
        (i.project_name && i.project_name.toLowerCase().includes(lower))
    );
  }, [allIssues, search]);

  const totalItems = (filteredIssues ?? []).length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentIssues = filteredIssues.slice((page - 1) * limit, page * limit);

  const handleDelete = () => {
    if (!issueToDelete) return;
    deleteIssue(issueToDelete.id, {
      onSuccess: () => {
        toast.success('Issue deleted successfully');
        setIssueToDelete(null);
      },
      onError: () => toast.error('Failed to delete issue'),
    });
  };

  const openCreate = () => {
    setIssueToEdit(null);
    setIsFormOpen(true);
  };

  const openEdit = (issue: Issue) => {
    setIssueToEdit(issue);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setIssueToEdit(null);
  };

  return (
    <>
      <IssueFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        issueToEdit={issueToEdit}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues, code, project..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <Link
            href="/issues/create"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Issue
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 w-16">No</th>
                <th className="px-6 py-4">Issue Code</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                    Failed to load issues.
                  </td>
                </tr>
              ) : currentIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No issues found. Click "Add Issue" to create one.
                  </td>
                </tr>
              ) : (
                currentIssues.map((issue, index) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {issue.issue_code ? (
                        <Link href={`/issues/${issue.id}`} className="hover:underline">
                          {issue.issue_code}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {issue.project_name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs uppercase tracking-wider ${priorityStyle(
                          issue.priority
                        )}`}
                      >
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${statusStyle(
                          issue.status
                        )}`}
                      >
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {issue.created_at
                        ? format(new Date(issue.created_at), 'dd MMM yyyy')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(issue)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Issue"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIssueToDelete(issue)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Issue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {[10, 20, 30, 40, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-700">|</div>
            <div>
              Showing {totalItems ? (page - 1) * limit + 1 : 0} to{' '}
              {Math.min(page * limit, totalItems)} of {totalItems}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {issueToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Delete Issue
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Are you sure you want to delete issue{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {issueToDelete.issue_code}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIssueToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl font-medium text-white bg-red-600 hover:bg-red-500 flex items-center gap-2 disabled:opacity-70 transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
