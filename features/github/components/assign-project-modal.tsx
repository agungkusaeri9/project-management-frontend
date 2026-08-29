'use client';

import { useState } from 'react';
import { X, Building2, Search, Check, Loader2, FolderKanban, Trash2 } from 'lucide-react';
import { useProjects } from '@/features/project/hooks/use-projects';
import { useLinkSingleGithubRepository } from '../hooks/use-github';
import { GithubRepository } from '../services/github.service';

interface AssignProjectModalProps {
  repo: GithubRepository;
  onClose: () => void;
}

export function AssignProjectModal({ repo, onClose }: AssignProjectModalProps) {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const linkMutation = useLinkSingleGithubRepository();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    repo.project_id || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const safeProjects = projects || [];

  const filteredProjects = safeProjects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(q))
    );
  });

  const handleSave = async () => {
    await linkMutation.mutateAsync({
      repoId: repo.id,
      projectId: selectedProjectId,
    });
    onClose();
  };

  const handleUnlink = async () => {
    await linkMutation.mutateAsync({
      repoId: repo.id,
      projectId: null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assign Repository ke Project
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {repo.full_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Project */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari project berdasarkan nama, kode, atau customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="p-4 overflow-y-auto max-h-72 space-y-2">
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Memuat daftar project...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic">
              Tidak ada project yang ditemukan.
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isSelected = selectedProjectId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 text-indigo-950 dark:text-indigo-100 font-medium'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {p.code}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </span>
                      </div>
                      {p.customer_name && (
                        <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{p.customer_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div>
            {repo.project_id && (
              <button
                type="button"
                onClick={handleUnlink}
                disabled={linkMutation.isPending}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Lepaskan Project
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={linkMutation.isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 shadow-sm"
            >
              {linkMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Simpan Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
