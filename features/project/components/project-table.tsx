'use client';

import { useState, useMemo } from 'react';
import { useProjects, useDeleteProject } from '../hooks/use-projects';
import { Search, Loader2, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Layers, FileSpreadsheet, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Project, projectService } from '../services/project.service';
import { AssignGithubModal } from './assign-github-modal';
import Link from 'next/link';

function GithubLogo({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function ProjectTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectForGithub, setProjectForGithub] = useState<Project | null>(null);
  
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
                      href={`/dashboard/projects/${project.id}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      {project.code}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {project.customer_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                      project.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      project.status === 'ongoing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      project.status === 'internal-testing' || project.status === 'internal_testing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      project.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      project.status === 'on-hold' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {project.status.replace('-', ' ').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {format(new Date(project.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs"
                        title="Lihat Detail Project"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setProjectForGithub(project)}
                        className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs"
                        title="Assign Repository GitHub"
                      >
                        <GithubLogo className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/dashboard/projects/${project.id}/modules`}
                        className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                        title="Manage Modules"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/dashboard/projects/${project.id}/uat`}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                        title="UAT & Testing Matrix"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await projectService.exportExcel(project.id, project.code || project.name);
                            toast.success(`Project ${project.name} berhasil diexport ke Excel!`);
                          } catch {
                            toast.error('Gagal mengexport project ke Excel');
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                        title="Export Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/dashboard/projects/${project.id}/edit`}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

      {/* Assign GitHub Modal */}
      {projectForGithub && (
        <AssignGithubModal
          project={projectForGithub}
          onClose={() => setProjectForGithub(null)}
        />
      )}
    </div>
  );
}
