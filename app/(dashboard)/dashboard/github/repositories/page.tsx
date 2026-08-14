'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  GitBranch,
  Search,
  RefreshCw,
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  Lock,
  Globe,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight,
  Code2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Filter,
  Tag,
  Hash,
  Eye
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { githubService, GithubRepository } from '@/features/github/services/github.service';
import { GithubRepoDetailModal } from '@/features/github/components/github-repo-detail-modal';

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

export default function GithubRepositoriesPage() {
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<string>('');
  const [hasRepoScope, setHasRepoScope] = useState<boolean | null>(null);
  const [tokenScopes, setTokenScopes] = useState<string>('');
  const [selectedRepoForModal, setSelectedRepoForModal] = useState<GithubRepository | null>(null);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVisibility, setSelectedVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks' | 'name'>('updated');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const fetchRepositories = async (showToast: boolean = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      else setIsLoading(true);
      setErrorMessage(null);

      const res = await githubService.getRepositories({
        visibility: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      });

      setRepositories(res.data || []);
      setOwnerInfo(res.owner || '');
      setHasRepoScope(res.has_repo_scope ?? null);
      setTokenScopes(res.token_scopes || '');
      if (showToast) {
        toast.success(`Berhasil memuat ${res.data?.length || 0} repository live dari GitHub!`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Gagal memuat repositori GitHub';
      setErrorMessage(msg);
      if (showToast) toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  // Extract unique languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    repositories.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repositories]);

  // Extract unique topics & git tags
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    repositories.forEach((r) => {
      if (r.tags && Array.isArray(r.tags)) {
        r.tags.forEach((t) => set.add(t));
      }
      if (r.topics && Array.isArray(r.topics)) {
        r.topics.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [repositories]);

  // Filtered and Sorted Repositories
  const filteredRepositories = useMemo(() => {
    let result = [...repositories];

    // Visibility filter
    if (selectedVisibility === 'public') {
      result = result.filter((r) => !r.private);
    } else if (selectedVisibility === 'private') {
      result = result.filter((r) => r.private);
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      result = result.filter((r) => r.language === selectedLanguage);
    }

    // Topic / Tag filter (matches git tags or topics)
    if (selectedTopic !== 'all') {
      result = result.filter(
        (r) =>
          (r.tags && r.tags.includes(selectedTopic)) ||
          (r.topics && r.topics.includes(selectedTopic))
      );
    }

    // Search query filter (matches name, full_name, description, language, topics, and git tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.full_name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.language && r.language.toLowerCase().includes(q)) ||
          (r.topics && r.topics.some((t) => t.toLowerCase().includes(q))) ||
          (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'stars') {
        return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      }
      if (sortBy === 'forks') {
        return (b.forks_count || 0) - (a.forks_count || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // Default: updated
      const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [repositories, selectedVisibility, selectedLanguage, selectedTopic, searchQuery, sortBy]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = repositories.length;
    const publicCount = repositories.filter((r) => !r.private).length;
    const privateCount = repositories.filter((r) => r.private).length;
    const totalStars = repositories.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = repositories.reduce((acc, r) => acc + (r.forks_count || 0), 0);

    return { total, publicCount, privateCount, totalStars, totalForks };
  }, [repositories]);

  // Pagination slice
  const totalItems = filteredRepositories.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentRepositories = filteredRepositories.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
              <GitBranch className="h-3.5 w-3.5" />
              <span>GitHub Repositories</span>
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Live REST API
            </span>
            {ownerInfo && (
              <span className="text-xs font-mono text-slate-500">
                Target: @{ownerInfo}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Daftar Repositori GitHub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daftar seluruh repository yang terhubung langsung secara live dari akun / organisasi GitHub Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => fetchRepositories(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Merefresh...' : 'Refresh Live'}</span>
          </button>

          <Link
            href="/dashboard/settings/github"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 px-3.5 py-2 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-2xs"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Konfigurasi GitHub</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Total Repos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-[10px] text-slate-400">repositori</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs dark:border-emerald-950/60 dark:bg-emerald-950/20">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            Public Repos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {stats.publicCount}
            </span>
            <span className="text-[10px] text-emerald-600">terbuka</span>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-4 shadow-2xs dark:border-indigo-950/60 dark:bg-indigo-950/20">
          <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block mb-1">
            Private Repos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
              {stats.privateCount}
            </span>
            <span className="text-[10px] text-indigo-600">terkunci</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-2xs dark:border-amber-950/60 dark:bg-amber-950/20">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            Total Stars
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">
              {stats.totalStars}
            </span>
            <span className="text-[10px] text-amber-600">bintang</span>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-4 shadow-2xs dark:border-violet-950/60 dark:bg-violet-950/20">
          <span className="text-xs font-bold text-violet-800 dark:text-violet-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5 text-violet-600" />
            Total Forks
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-violet-700 dark:text-violet-300">
              {stats.totalForks}
            </span>
            <span className="text-[10px] text-violet-600">forks</span>
          </div>
        </div>
      </div>

      {/* Error state if not configured */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 dark:border-red-900/50 dark:bg-red-950/30 text-red-900 dark:text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Gagal Mengambil Repositori</h3>
              <p className="text-xs mt-0.5 text-red-700 dark:text-red-300">{errorMessage}</p>
            </div>
          </div>
          <Link
            href="/dashboard/settings/github"
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors shrink-0 shadow-2xs"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Periksa Token GitHub</span>
          </Link>
        </div>
      )}

      {/* Scope Warning Banner if token lacks repo permission */}
      {hasRepoScope === false && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Hanya Menampilkan Repository Publik:</span> Token Anda saat ini memiliki izin (scopes):{' '}
              <code className="bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded font-mono text-[10px]">{tokenScopes || 'tanpa scope / public only'}</code>.{' '}
              Untuk memuat repositori <strong>Private</strong>, pastikan mencentang scope <strong>repo</strong> saat membuat Personal Access Token di GitHub.
            </div>
          </div>
          <Link
            href="/dashboard/settings/github"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition-colors"
          >
            <span>Update Token</span>
          </Link>
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-wrap bg-slate-50/50 dark:bg-slate-950/40">
          
          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari repository, bahasa, deskripsi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            {/* Visibility Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Tipe:</span>
              <select
                value={selectedVisibility}
                onChange={(e) => {
                  setSelectedVisibility(e.target.value as any);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="all">Semua Visibilitas</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>
            </div>

            {/* Language Filter */}
            {availableLanguages.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Bahasa:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Semua Bahasa ({availableLanguages.length})</option>
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tag / Topic Filter */}
            {availableTopics.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Tag:</span>
                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Semua Tag ({availableTopics.length})</option>
                  {availableTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      #{topic}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="updated">Terakhir Diupdate</option>
                <option value="stars">Bintang (Stars) Terbanyak</option>
                <option value="forks">Forks Terbanyak</option>
                <option value="name">Nama (A - Z)</option>
              </select>
            </div>

            {/* Per Page */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

          </div>

        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="px-5 py-3.5 w-12 text-center">No</th>
                <th className="px-5 py-3.5">Repository</th>
                <th className="px-5 py-3.5">Bahasa</th>
                <th className="px-5 py-3.5">Tags / Topics</th>
                <th className="px-5 py-3.5">Deskripsi</th>
                <th className="px-5 py-3.5 text-center">Stats</th>
                <th className="px-5 py-3.5">Default Branch</th>
                <th className="px-5 py-3.5">Terakhir Update</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <RefreshCw className="h-7 w-7 animate-spin text-indigo-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Mengambil repositori live dari GitHub REST API...</p>
                  </td>
                </tr>
              ) : currentRepositories.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <GitBranch className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada repository ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {repositories.length === 0
                        ? 'Pastikan token GitHub telah dikonfigurasi di menu Pengaturan GitHub.'
                        : 'Coba ubah kata kunci pencarian atau filter yang digunakan.'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentRepositories.map((repo, idx) => {
                  const langColor = repo.language ? languageColorMap[repo.language] || 'bg-slate-400' : 'bg-slate-300';
                  return (
                    <tr key={repo.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* No */}
                      <td className="px-5 py-4 text-center font-medium text-slate-400">
                        {(page - 1) * limit + idx + 1}
                      </td>

                      {/* Repo Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2.5">
                          <img
                            src={repo.owner.avatar_url}
                            alt={repo.owner.login}
                            className="h-6 w-6 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 mt-0.5"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setSelectedRepoForModal(repo)}
                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-xs text-left cursor-pointer"
                              >
                                {repo.name}
                              </button>
                              {repo.private ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                                  <Lock className="h-2.5 w-2.5" />
                                  Private
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  <Globe className="h-2.5 w-2.5" />
                                  Public
                                </span>
                              )}
                              {repo.fork && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/60">
                                  <GitFork className="h-2.5 w-2.5" />
                                  Fork
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {repo.full_name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Language */}
                      <td className="px-5 py-4">
                        {repo.language ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                            <span className={`h-2.5 w-2.5 rounded-full ${langColor}`} />
                            <span>{repo.language}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Tags / Topics */}
                      <td className="px-5 py-4 max-w-[220px]">
                        {(repo.tags && repo.tags.length > 0) || (repo.topics && repo.topics.length > 0) ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Git Release Tags */}
                            {repo.tags && repo.tags.length > 0 && (
                              repo.tags.slice(0, 2).map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTopic(tag);
                                    setPage(1);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-400 hover:bg-emerald-100 transition-colors shadow-2xs font-mono"
                                  title={`Git Release Tag: ${tag}`}
                                >
                                  <Tag className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>{tag}</span>
                                </button>
                              ))
                            )}

                            {/* GitHub Topics */}
                            {repo.topics && repo.topics.length > 0 && (
                              repo.topics.slice(0, 2).map((topic) => (
                                <button
                                  key={topic}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTopic(topic);
                                    setPage(1);
                                  }}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                  <span className="text-indigo-500 font-bold">#</span>
                                  <span>{topic}</span>
                                </button>
                              ))
                            )}

                            {/* Overflow Badge */}
                            {((repo.tags?.length || 0) + (repo.topics?.length || 0) > 4) && (
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40"
                                title={[...(repo.tags || []), ...(repo.topics || [])].join(', ')}
                              >
                                +{((repo.tags?.length || 0) + (repo.topics?.length || 0)) - 4}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {repo.description || '-'}
                        </p>
                      </td>

                      {/* Stats */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 font-mono">
                          <span className="flex items-center gap-1" title="Stars">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-400" />
                            <span>{repo.stargazers_count}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Forks">
                            <GitFork className="h-3 w-3 text-violet-500" />
                            <span>{repo.forks_count}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Open Issues">
                            <AlertCircle className="h-3 w-3 text-emerald-500" />
                            <span>{repo.open_issues_count}</span>
                          </span>
                        </div>
                      </td>

                      {/* Default Branch */}
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {repo.default_branch || 'main'}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="px-5 py-4 text-slate-500">
                        {repo.updated_at ? (
                          <div className="space-y-0.5 min-w-[155px]">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                              <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                              <span className="font-mono text-[11px]">{format(new Date(repo.updated_at), 'dd MMM yyyy, HH:mm:ss')}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 pl-5 font-medium">
                              {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true, locale: idLocale })}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRepoForModal(repo)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs"
                            title="Lihat Detail Repository"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs"
                            title="Buka di GitHub"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Menampilkan {totalItems ? (page - 1) * limit + 1 : 0} s/d {Math.min(page * limit, totalItems)} dari {totalItems} repositories
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300 px-2">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Large XL Repository Detail Modal */}
      <GithubRepoDetailModal
        isOpen={!!selectedRepoForModal}
        onClose={() => setSelectedRepoForModal(null)}
        repo={selectedRepoForModal}
      />
    </div>
  );
}
