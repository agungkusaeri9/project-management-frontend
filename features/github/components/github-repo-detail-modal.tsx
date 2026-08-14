'use client';

import { useState, useEffect } from 'react';
import {
  X,
  GitBranch,
  Tag,
  GitCommit,
  GitPullRequest,
  Star,
  GitFork,
  AlertCircle,
  Lock,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  User,
  Clock,
  ShieldCheck,
  Download,
  Terminal,
  RefreshCw,
  Info,
  CheckCircle2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  githubService,
  GithubRepository,
  GithubBranch,
  GithubTag,
  GithubCommit,
  GithubPullRequest
} from '../services/github.service';

interface GithubRepoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: GithubRepository | null;
}

export function GithubRepoDetailModal({ isOpen, onClose, repo }: GithubRepoDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'branches' | 'tags' | 'commits' | 'pulls' | 'overview'>('branches');
  
  // Data states
  const [branches, setBranches] = useState<GithubBranch[]>([]);
  const [tags, setTags] = useState<GithubTag[]>([]);
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [pullRequests, setPullRequests] = useState<GithubPullRequest[]>([]);
  
  // Loading states
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(false);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState<boolean>(false);
  const [isLoadingPulls, setIsLoadingPulls] = useState<boolean>(false);

  // Selected branch for commits filter
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  // Copy state
  const [copiedClone, setCopiedClone] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && repo) {
      setActiveTab('branches');
      setSelectedBranch(repo.default_branch || 'main');
      loadAllRepoData(repo.owner.login, repo.name);
    }
  }, [isOpen, repo]);

  const loadAllRepoData = async (owner: string, repoName: string) => {
    // 1. Load Branches
    setIsLoadingBranches(true);
    githubService.getBranches(owner, repoName)
      .then((data) => setBranches(data))
      .catch((err) => console.error('Failed to load branches:', err))
      .finally(() => setIsLoadingBranches(false));

    // 2. Load Tags
    setIsLoadingTags(true);
    githubService.getTags(owner, repoName)
      .then((data) => setTags(data))
      .catch((err) => console.error('Failed to load tags:', err))
      .finally(() => setIsLoadingTags(false));

    // 3. Load Commits
    setIsLoadingCommits(true);
    githubService.getCommits(owner, repoName)
      .then((data) => setCommits(data))
      .catch((err) => console.error('Failed to load commits:', err))
      .finally(() => setIsLoadingCommits(false));

    // 4. Load Pull Requests
    setIsLoadingPulls(true);
    githubService.getPullRequests(owner, repoName)
      .then((data) => setPullRequests(data))
      .catch((err) => console.error('Failed to load PRs:', err))
      .finally(() => setIsLoadingPulls(false));
  };

  const handleBranchChange = (branchName: string) => {
    setSelectedBranch(branchName);
    if (!repo) return;
    setIsLoadingCommits(true);
    githubService.getCommits(repo.owner.login, repo.name, branchName)
      .then((data) => setCommits(data))
      .catch((err) => console.error('Failed to filter commits by branch:', err))
      .finally(() => setIsLoadingCommits(false));
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClone(type);
    toast.success(`${type} disalin ke clipboard!`);
    setTimeout(() => setCopiedClone(null), 2500);
  };

  if (!isOpen || !repo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container: Large (max-w-5xl) */}
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-start gap-3.5">
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              className="h-10 w-10 rounded-full ring-2 ring-indigo-500/20 shrink-0 mt-0.5"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {repo.name}
                </h2>
                {repo.private ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                    <Lock className="h-3 w-3" />
                    Private
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Globe className="h-3 w-3" />
                    Public
                  </span>
                )}
                {repo.fork && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/80">
                    <GitFork className="h-3 w-3" />
                    Fork
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {repo.full_name}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <span>Buka di GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 overflow-x-auto text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4 shrink-0 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">Default Branch:</span>
              <span className="font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {repo.default_branch || 'main'}
              </span>
            </span>

            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-400">Bahasa:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{repo.language}</span>
              </span>
            )}

            <span className="flex items-center gap-1.5" title="Total Stars">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{repo.stargazers_count}</span>
            </span>

            <span className="flex items-center gap-1.5" title="Total Forks">
              <GitFork className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{repo.forks_count}</span>
            </span>

            <span className="flex items-center gap-1.5" title="Open Issues">
              <AlertCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{repo.open_issues_count}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
            {repo.updated_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Update: {format(new Date(repo.updated_at), 'dd MMM yyyy, HH:mm')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 bg-slate-50/40 dark:bg-slate-950/30 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('branches')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'branches'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            <span>Branches</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
              {branches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tags'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Tags & Releases</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
              {tags.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commits')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'commits'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GitCommit className="h-4 w-4" />
            <span>Recent Commits</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
              {commits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pulls')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pulls'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GitPullRequest className="h-4 w-4" />
            <span>Pull Requests</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
              {pullRequests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Info className="h-4 w-4" />
            <span>Clone & Info</span>
          </button>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">

          {/* TAB 1: BRANCHES */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daftar Branch Repository ({branches.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menampilkan seluruh branch dengan rincian author commit terakhir dan waktu update spesifik.
                  </p>
                </div>
              </div>

              {isLoadingBranches ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw className="h-7 w-7 animate-spin text-indigo-600 mb-2" />
                  <span className="text-xs font-medium">Memuat data branch dari GitHub...</span>
                </div>
              ) : branches.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <GitBranch className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Tidak ada branch ditemukan</p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {branches.map((b) => {
                    const isDefault = b.name === repo.default_branch;
                    return (
                      <div
                        key={b.name}
                        className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {b.name}
                            </span>
                            {isDefault && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900">
                                Default Branch
                              </span>
                            )}
                            {b.protected && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                                <ShieldCheck className="h-3 w-3" />
                                Protected
                              </span>
                            )}
                          </div>

                          {b.commit_message && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">
                              {b.commit_message}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                            {b.author_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{b.author_name}</span>
                              </span>
                            )}
                            {b.sha && (
                              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {b.sha.slice(0, 7)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Last Updated Timestamp per branch */}
                        <div className="shrink-0 text-left sm:text-right space-y-1">
                          {b.commit_date ? (
                            <>
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center sm:justify-end gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                <span>
                                  {formatDistanceToNow(new Date(b.commit_date), {
                                    addSuffix: true,
                                    locale: idLocale,
                                  })}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                {format(new Date(b.commit_date), 'dd MMM yyyy, HH:mm')}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TAGS & RELEASES */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Git Release Tags ({tags.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar release tag yang telah di-tag dan di-push ke GitHub untuk versi rilis.
                </p>
              </div>

              {isLoadingTags ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw className="h-7 w-7 animate-spin text-indigo-600 mb-2" />
                  <span className="text-xs font-medium">Memuat tags dari GitHub...</span>
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <Tag className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Belum ada Git Release Tag di repository ini</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Buat tag di git lokal dengan perintah: <br />
                    <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">
                      git tag -a v0.1.0 -m &quot;Release v0.1.0&quot; && git push origin v0.1.0
                    </code>
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {tags.map((t) => (
                    <div
                      key={t.name}
                      className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-mono">
                            <Tag className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{t.name}</span>
                          </span>
                          {t.sha && (
                            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              commit {t.sha.slice(0, 7)}
                            </span>
                          )}
                        </div>

                        {t.commit_message && (
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            {t.commit_message}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          {t.author_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{t.author_name}</span>
                            </span>
                          )}
                          {t.commit_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(t.commit_date), 'dd MMM yyyy, HH:mm')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Download Assets */}
                      <div className="flex items-center gap-2 shrink-0">
                        {t.zipball_url && (
                          <a
                            href={t.zipball_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Source (zip)</span>
                          </a>
                        )}
                        {t.tarball_url && (
                          <a
                            href={t.tarball_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>tar.gz</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECENT COMMITS */}
          {activeTab === 'commits' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Histori Commit Terbaru ({commits.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aktivitas commit terbaru pada branch yang dipilih.
                  </p>
                </div>

                {/* Branch selector */}
                {branches.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Branch:</span>
                    <select
                      value={selectedBranch}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200"
                    >
                      {branches.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name} {b.name === repo.default_branch ? '(default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {isLoadingCommits ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw className="h-7 w-7 animate-spin text-indigo-600 mb-2" />
                  <span className="text-xs font-medium">Memuat riwayat commit...</span>
                </div>
              ) : commits.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <GitCommit className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Tidak ada commit ditemukan pada branch ini</p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {commits.map((c) => (
                    <div
                      key={c.sha}
                      className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <GitCommit className="h-4 w-4 text-indigo-500 shrink-0" />
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                            {c.commit.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pl-6 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                            {c.author?.avatar_url && (
                              <img
                                src={c.author.avatar_url}
                                alt={c.commit.author.name}
                                className="h-4 w-4 rounded-full"
                              />
                            )}
                            <span>{c.commit.author.name}</span>
                          </span>

                          <span>&bull;</span>

                          <span>
                            {c.commit.author.date &&
                              format(new Date(c.commit.author.date), 'dd MMM yyyy, HH:mm')}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 pl-6 sm:pl-0">
                        <a
                          href={c.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          {c.sha.slice(0, 7)}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PULL REQUESTS */}
          {activeTab === 'pulls' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daftar Pull Requests ({pullRequests.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Permintaan penggabungan (Pull Request) pada repository ini.
                </p>
              </div>

              {isLoadingPulls ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <RefreshCw className="h-7 w-7 animate-spin text-indigo-600 mb-2" />
                  <span className="text-xs font-medium">Memuat pull requests...</span>
                </div>
              ) : pullRequests.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <GitPullRequest className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Tidak ada pull request aktif pada repository ini</p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {pullRequests.map((pr) => (
                    <div
                      key={pr.id}
                      className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            #{pr.number} {pr.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pr.state === 'open'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                                : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200'
                            }`}
                          >
                            {pr.state.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          <span>oleh @{pr.user.login}</span>
                          <span>&bull;</span>
                          {pr.head && pr.base && (
                            <span className="font-mono text-[10px]">
                              {pr.head.ref} &rarr; {pr.base.ref}
                            </span>
                          )}
                          <span>&bull;</span>
                          <span>{format(new Date(pr.created_at), 'dd MMM yyyy')}</span>
                        </div>
                      </div>

                      <a
                        href={pr.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>Lihat PR</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: OVERVIEW & CLONE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Description box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi Repository</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {repo.description || 'Tidak ada deskripsi yang ditulis untuk repository ini.'}
                </p>
              </div>

              {/* Clone URLs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Clone Repository</h4>
                
                {/* HTTPS */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">HTTPS:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${repo.html_url}.git`}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-700 dark:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(`${repo.html_url}.git`, 'HTTPS URL')}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
                    >
                      {copiedClone === 'HTTPS URL' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedClone === 'HTTPS URL' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                {/* Git CLI command */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Perintah Git Clone:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`git clone ${repo.html_url}.git`}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-700 dark:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(`git clone ${repo.html_url}.git`, 'Git Clone')}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
                    >
                      {copiedClone === 'Git Clone' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Terminal className="h-3.5 w-3.5" />}
                      <span>{copiedClone === 'Git Clone' ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Repository ID</span>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{repo.id}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Ukuran Repo</span>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{repo.size} KB</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Dibuat Pada</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {repo.created_at ? format(new Date(repo.created_at), 'dd MMM yyyy') : '-'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Terakhir Push</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {repo.pushed_at ? format(new Date(repo.pushed_at), 'dd MMM yyyy') : '-'}
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terhubung langsung ke GitHub REST API (Live)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Tutup Modal
          </button>
        </div>

      </div>
    </div>
  );
}
