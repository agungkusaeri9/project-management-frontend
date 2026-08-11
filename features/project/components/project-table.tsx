'use client';

import { useState, useMemo } from 'react';
import { useProjects, useDeleteProject } from '../hooks/use-projects';
import { Search, Loader2, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Project } from '../services/project.service';
import Link from 'next/link';

export function ProjectTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const { data: allProjects = [], isLoading, isError } = useProjects();

  // Client-side filtering
  const filteredProjects = useMemo(() => {
    const safeProjects = allProjects || [];
    if (!search.trim()) return safeProjects;
    const lowerSearch = search.toLowerCase();
    return safeProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.code.toLowerCase().includes(lowerSearch)
    );
  }, [allProjects, search]);

  // Client-side pagination
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentProjects = filteredProjects.slice((page - 1) * limit, page * limit);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on search
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 w-16">No</th>
              <th className="px-6 py-4">Project Code</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                  Failed to load projects.
                </td>
              </tr>
            ) : currentProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              currentProjects.map((project, index) => (
                <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      {project.code}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {project.customer_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                      project.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      project.status === 'ongoing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      project.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {format(new Date(project.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/projects/${project.id}/modules`}
                        className="p-2 text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
                        title="Manage Modules"
                      >
                        <Layers className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
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

      {/* Pagination Controls */}
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
                <option key={size} value={size}>{size}</option>
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

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Project</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">{projectToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProject(projectToDelete.id, {
                    onSuccess: () => {
                      toast.success('Project deleted successfully');
                      setProjectToDelete(null);
                    },
                    onError: () => toast.error('Failed to delete project')
                  });
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl font-medium text-white bg-red-600 hover:bg-red-500 flex items-center gap-2 disabled:opacity-70 transition-colors"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
