'use client';

import { useState, useMemo, useEffect } from 'react';
import { Module } from '../services/module.service';
import { useModules, useCreateModule, useUpdateModule, useDeleteModule } from '../hooks/use-modules';
import { Search, Loader2, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Plus, X, Save } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ModuleTableProps {
  projectId: string;
}

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  moduleToEdit?: Module | null;
  totalModules: number;
}

function ModuleFormModal({ isOpen, onClose, projectId, moduleToEdit, totalModules }: ModuleFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { mutate: createModule, isPending: isCreating } = useCreateModule();
  const { mutate: updateModule, isPending: isUpdating } = useUpdateModule();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      setName(moduleToEdit?.name ?? '');
      setDescription(moduleToEdit?.description ?? '');
    }
  }, [isOpen, moduleToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (moduleToEdit) {
      updateModule(
        { id: moduleToEdit.id, data: { ...moduleToEdit, name: name.trim(), description: description.trim() || null } },
        {
          onSuccess: () => { toast.success('Module updated'); onClose(); },
          onError: () => toast.error('Failed to update module'),
        }
      );
    } else {
      createModule(
        { project_id: projectId, name: name.trim(), description: description.trim() || null, sort_order: totalModules + 1 },
        {
          onSuccess: () => { toast.success('Module created'); onClose(); },
          onError: () => toast.error('Failed to create module'),
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {moduleToEdit ? 'Edit Module' : 'Add New Module'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Module Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Authentication"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Module description..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors resize-none"
            />
          </div>
          <div className="pt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-indigo-500/20 transition-all"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {moduleToEdit ? 'Save Changes' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModuleTable({ projectId }: ModuleTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [moduleToEdit, setModuleToEdit] = useState<Module | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: allModules = [], isLoading, isError } = useModules(projectId);
  const { mutate: deleteModule, isPending: isDeleting } = useDeleteModule();

  const filteredModules = useMemo(() => {
    const safe = allModules ?? [];
    if (!search.trim()) return safe;
    const lower = search.toLowerCase();
    return safe.filter((m) => m.name.toLowerCase().includes(lower));
  }, [allModules, search]);

  const totalItems = (filteredModules ?? []).length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentModules = filteredModules.slice((page - 1) * limit, page * limit);

  const handleDelete = () => {
    if (!moduleToDelete) return;
    deleteModule(
      { id: moduleToDelete.id, parentId: projectId },
      {
        onSuccess: () => { toast.success('Module deleted'); setModuleToDelete(null); },
        onError: () => toast.error('Failed to delete module'),
      }
    );
  };

  const openCreate = () => { setModuleToEdit(null); setIsFormOpen(true); };
  const openEdit = (m: Module) => { setModuleToEdit(m); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setModuleToEdit(null); };

  return (
    <>
      <ModuleFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        projectId={projectId}
        moduleToEdit={moduleToEdit}
        totalModules={(allModules ?? []).length}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 w-16">No</th>
                <th className="px-6 py-4">Module Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></td></tr>
              ) : isError ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-red-500">Failed to load modules.</td></tr>
              ) : currentModules.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No modules yet. Click "Add Module" to get started.</td></tr>
              ) : (
                currentModules.map((module, index) => (
                  <tr key={module.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-medium">{(page - 1) * limit + index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{module.name}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{module.description || '-'}</td>
                    <td className="px-6 py-4 text-slate-500">{module.sort_order}</td>
                    <td className="px-6 py-4 text-slate-500">{format(new Date(module.created_at), 'dd MMM yyyy')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/modules/${module.id}/features`}
                          className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="View Features"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEdit(module)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Module"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setModuleToDelete(module)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Module"
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
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {[10, 20, 30, 40, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
              <span>entries</span>
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-slate-700">|</div>
            <div>Showing {totalItems ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalItems)} of {totalItems}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {moduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Module</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">{moduleToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModuleToDelete(null)} disabled={isDeleting} className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 rounded-xl font-medium text-white bg-red-600 hover:bg-red-500 flex items-center gap-2 disabled:opacity-70 transition-colors">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
