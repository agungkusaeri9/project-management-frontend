'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Loader2,
  GitBranch,
  Lock,
  Globe,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  useProjectGithubRepositories,
  useAllGithubRepositories,
  useLinkProjectRepositories,
} from '@/features/github/hooks/use-github';
import { Project } from '../services/project.service';

interface AssignGithubModalProps {
  project: Project;
  onClose: () => void;
}

export function AssignGithubModal({ project, onClose }: AssignGithubModalProps) {
  const { data: projectRepos, isLoading: isLoadingProjectRepos } =
    useProjectGithubRepositories(project.id);
  const { data: allReposData, isLoading: isLoadingAll } = useAllGithubRepositories();
  const linkMutation = useLinkProjectRepositories();

  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const allRepos = allReposData?.data || [];

  useEffect(() => {
    if (projectRepos) {
      setSelectedRepoIds(projectRepos.map((r) => r.id));
    }
  }, [projectRepos]);

  const handleToggleRepo = (repoId: number) => {
    setSelectedRepoIds((prev) =>
      prev.includes(repoId) ? prev.filter((id) => id !== repoId) : [...prev, repoId]
    );
  };

  const handleSave = async () => {
    await linkMutation.mutateAsync({
      projectId: project.id,
      repositoryIds: selectedRepoIds,
    });
    onClose();
  };

  const filteredAllRepos = useMemo(() => {
    if (!searchQuery.trim()) return allRepos;
    const q = searchQuery.toLowerCase().trim();
    return allRepos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.full_name.toLowerCase().includes(q) ||
        (r.language && r.language.toLowerCase().includes(q))
    );
  }, [allRepos, searchQuery]);

  const isLoading = isLoadingProjectRepos || isLoadingAll;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-2xs">
              <GitBranch className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Assign Repository GitHub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Project: <span className="font-semibold text-slate-700 dark:text-slate-200">{project.name}</span> ({project.code})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari repositori GitHub berdasarkan nama atau bahasa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Modal Repositories List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Memuat repositori GitHub...</span>
            </div>
          ) : filteredAllRepos.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs italic">
              Tidak ada repositori GitHub yang ditemukan.
            </div>
          ) : (
            filteredAllRepos.map((r) => {
              const isChecked = selectedRepoIds.includes(r.id);
              const assignedToOther =
                r.project_id && r.project_id !== project.id && r.internal_project_name;

              return (
                <div
                  key={r.id}
                  onClick={() => handleToggleRepo(r.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-100'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {r.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                            r.private
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {r.private ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                          {r.private ? 'Private' : 'Public'}
                        </span>
                        {assignedToOther && !isChecked && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Terhubung ke: {r.internal_project_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
                        {r.full_name} {r.language ? `• ${r.language}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                    {r.latest_tag && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        <Tag className="w-2.5 h-2.5 text-indigo-500" />
                        {r.latest_tag}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {selectedRepoIds.length} repositori dipilih
          </span>

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
