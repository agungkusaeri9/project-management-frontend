'use client';

import { useState, useMemo } from 'react';
import {
  GitBranch,
  Search,
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  Lock,
  Globe,
  Plus,
  Trash2,
  Tag,
  Check,
  Loader2,
  Calendar,
  Layers,
  Code2,
  X,
  RefreshCw,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  useProjectGithubRepositories,
  useAllGithubRepositories,
  useLinkProjectRepositories,
} from '@/features/github/hooks/use-github';
import { GithubRepository } from '@/features/github/services/github.service';
import { GithubRepoDetailModal } from '@/features/github/components/github-repo-detail-modal';

interface ProjectGithubSectionProps {
  projectId: string;
  projectName: string;
}

const languageColorMap: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Go: 'bg-cyan-500',
  'C#': 'bg-purple-600',
  Python: 'bg-emerald-500',
  PHP: 'bg-indigo-400',
  Java: 'bg-amber-600',
  Rust: 'bg-orange-600',
  HTML: 'bg-rose-500',
  CSS: 'bg-pink-500',
  Ruby: 'bg-red-600',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-violet-500',
  Shell: 'bg-lime-600',
  Dart: 'bg-teal-500',
};

export function ProjectGithubSection({ projectId, projectName }: ProjectGithubSectionProps) {
  const { data: projectRepos, isLoading, isFetching } = useProjectGithubRepositories(projectId);
  const { data: allReposData, isLoading: isLoadingAll } = useAllGithubRepositories();
  const linkMutation = useLinkProjectRepositories();

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepoForDetail, setSelectedRepoForDetail] = useState<GithubRepository | null>(null);

  const safeProjectRepos = projectRepos || [];
  const allRepos = allReposData?.data || [];

  const handleOpenManageModal = () => {
    setSelectedRepoIds(safeProjectRepos.map((r) => r.id));
    setSearchQuery('');
    setIsManageModalOpen(true);
  };

  const handleToggleRepo = (repoId: number) => {
    setSelectedRepoIds((prev) =>
      prev.includes(repoId) ? prev.filter((id) => id !== repoId) : [...prev, repoId]
    );
  };

  const handleSaveAssignments = async () => {
    await linkMutation.mutateAsync({
      projectId,
      repositoryIds: selectedRepoIds,
    });
    setIsManageModalOpen(false);
  };

  const handleUnlinkSingle = async (repoId: number) => {
    const updated = safeProjectRepos.filter((r) => r.id !== repoId).map((r) => r.id);
    await linkMutation.mutateAsync({
      projectId,
      repositoryIds: updated,
    });
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-6 print:border-slate-300 print:shadow-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-2xs">
            <GitBranch className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                GitHub Repositories
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {safeProjectRepos.length} Repositori
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Repositori kode sumber yang dihubungkan ke project ini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 print:hidden">
          <button
            type="button"
            onClick={handleOpenManageModal}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xs"
            title="Assign Repository GitHub"
          >
            <Plus className="w-4 h-4" />
          </button>

          <Link
            href="/dashboard/github/repositories"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title="Buka Halaman Semua Repositori GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            <p className="text-xs">Memuat repositori GitHub yang terhubung...</p>
          </div>
        ) : safeProjectRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 border border-slate-200 dark:border-slate-700">
              <GitBranch className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Belum ada repositori GitHub yang dihubungkan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              Hubungkan repositori GitHub ke project ini untuk memantau commit, branch, release tags, dan aktivitas development.
            </p>
            <button
              type="button"
              onClick={handleOpenManageModal}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
              title="Pilih & Hubungkan Repositori"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeProjectRepos.map((repo) => (
              <div
                key={repo.id}
                className="group relative flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-2xs"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate max-w-xs">
                        {repo.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          repo.private
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {repo.private ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{repo.full_name}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedRepoForDetail(repo)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                      title="Lihat Detail Repositori (Branches, Commits, Tags, Pull Requests)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                      title="Buka di GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleUnlinkSingle(repo.id)}
                      disabled={linkMutation.isPending}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Lepaskan dari project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {repo.description ? (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                    {repo.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic mb-3">Tidak ada deskripsi</p>
                )}

                {/* Stats & Meta Footer */}
                <div className="mt-auto pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            languageColorMap[repo.language] || 'bg-slate-400'
                          }`}
                        />
                        <span>{repo.language}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1" title="Default branch">
                      <GitBranch className="w-3 h-3 text-slate-400" />
                      <span className="font-mono text-[11px]">{repo.default_branch}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {repo.latest_tag && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        <Tag className="w-2.5 h-2.5" />
                        {repo.latest_tag}
                      </span>
                    )}
                    {repo.pushed_at && (
                      <span className="text-[11px] text-slate-400" title={repo.pushed_at}>
                        {formatDistanceToNow(new Date(repo.pushed_at), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manage Assignment Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Assign Repository GitHub
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilih repositori yang akan dihubungkan ke project: <span className="font-semibold text-slate-700 dark:text-slate-200">{projectName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
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
              {isLoadingAll ? (
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs">Memuat daftar repositori...</span>
                </div>
              ) : filteredAllRepos.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  Tidak ada repositori yang cocok dengan pencarian.
                </div>
              ) : (
                filteredAllRepos.map((r) => {
                  const isChecked = selectedRepoIds.includes(r.id);
                  const assignedToOther =
                    r.project_id && r.project_id !== projectId && r.internal_project_name;

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
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {r.default_branch}
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
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
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
                  onClick={() => setIsManageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={linkMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 shadow-sm"
                >
                  {linkMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repo Detail Modal */}
      <GithubRepoDetailModal
        isOpen={!!selectedRepoForDetail}
        repo={selectedRepoForDetail}
        onClose={() => setSelectedRepoForDetail(null)}
      />
    </div>
  );
}
