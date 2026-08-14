'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Kanban,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  AlertCircle,
  FolderGit2,
  ListTodo,
  CheckCircle2,
  Clock,
  User,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import {
  jiraService,
  JiraBoardCompleteData,
  JiraConfigData,
} from '@/features/jira/services/jira.service';

export default function JiraBoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const resolvedParams = use(params);
  const boardId = resolvedParams.boardId;

  const [boardDetail, setBoardDetail] = useState<JiraBoardCompleteData | null>(null);
  const [jiraConfig, setJiraConfig] = useState<JiraConfigData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'issues' | 'backlog' | 'sprints'>('issues');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [configRes, detailRes] = await Promise.allSettled([
          jiraService.getConfig(),
          jiraService.getBoardComplete(boardId),
        ]);

        if (!ignore) {
          if (configRes.status === 'fulfilled' && configRes.value) {
            setJiraConfig(configRes.value);
          }

          if (detailRes.status === 'fulfilled' && detailRes.value) {
            setBoardDetail(detailRes.value);
          } else if (detailRes.status === 'rejected') {
            const err = detailRes.reason;
            const msg = err instanceof Error ? err.message : 'Gagal memuat detail board Jira';
            setErrorMessage(msg);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data';
          setErrorMessage(msg);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [boardId]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage(null);
      const data = await jiraService.getBoardComplete(boardId, true);
      setBoardDetail(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal merefresh data board Jira';
      setErrorMessage(msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSyncProject = async (projectKey?: string) => {
    if (!projectKey) return;
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const res = await jiraService.syncIssues({
        project_key: projectKey,
        auto_save: true,
      });

      const list = res.data.issues || [];
      if (typeof window !== 'undefined') {
        localStorage.setItem('toho_jira_synced_issues', JSON.stringify(list));
      }

      setSyncMessage(`Berhasil menyinkronkan ${list.length} tiket dari project ${projectKey} ke sistem dan kalender!`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal sinkronisasi';
      setSyncMessage(`Error: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const boardInfo = boardDetail?.board;
  const projectKey = boardInfo?.location?.projectKey || 'JIRA';
  const projectName = boardInfo?.location?.projectName || boardInfo?.location?.displayName || boardInfo?.name || `Board #${boardId}`;
  const boardName = boardInfo?.name || `Board #${boardId}`;
  const projectType = boardInfo?.location?.projectTypeKey || boardInfo?.type || 'software';

  const jiraWebUrl = jiraConfig?.host
    ? `${jiraConfig.host}/jira/software/projects/${projectKey}/boards/${boardId}`
    : `https://atlassian.net/jira/software/projects/${projectKey}/boards/${boardId}`;

  // Issue Lists
  const activeIssues = boardDetail?.issues?.issues || [];
  const backlogIssues = boardDetail?.backlog?.issues || [];
  const sprints = boardDetail?.sprints?.values || [];

  // Filter Active Issues / Backlog by Search Query & Status
  const currentList = activeTab === 'issues' ? activeIssues : activeTab === 'backlog' ? backlogIssues : [];
  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      item.key?.toLowerCase().includes(q) ||
      item.fields.summary?.toLowerCase().includes(q) ||
      item.fields.assignee?.displayName?.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (statusFilter === 'all') return true;

    const statusName = item.fields.status?.name?.toLowerCase() || '';
    const isDone = statusName.includes('done') || statusName.includes('closed') || statusName.includes('resolved');
    const isInProgress = statusName.includes('progress') || statusName.includes('review') || statusName.includes('test');

    if (statusFilter === 'closed') return isDone;
    if (statusFilter === 'in_progress') return isInProgress && !isDone;
    if (statusFilter === 'open') return !isDone && !isInProgress;

    return true;
  });

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          href="/dashboard/jira/projects"
          className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Jira Projects</span>
        </Link>
        <span>/</span>
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{projectKey}</span>
        <span>/</span>
        <span className="text-slate-400 truncate max-w-xs">{boardName}</span>
      </div>

      {/* Main Board Hero Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            {boardInfo?.location?.avatarURI ? (
              <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={boardInfo.location.avatarURI}
                  alt={projectName}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shrink-0 shadow-xs">
                <FolderGit2 className="h-7 w-7" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {projectName}
                </h1>
                <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                  {projectKey}
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 capitalize">
                  {projectType}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Kanban className="h-3.5 w-3.5 text-slate-400" />
                <span>{boardName}</span>
                <span>•</span>
                <span className="font-mono">Board ID: #{boardId}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSyncProject(projectKey)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Tiket ke Kalender'}</span>
            </button>

            <a
              href={jiraWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors shadow-2xs"
            >
              <span>Buka di Jira</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Sync Success Banner */}
        {syncMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-900 dark:border-emerald-950/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Issues
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              {activeIssues.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Backlog Items
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              {backlogIssues.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sprints
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              {sprints.length}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Tiket Terdeteksi
            </div>
            <div className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
              {activeIssues.length + backlogIssues.length}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 dark:border-red-950/60 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Tabs & Search Filter Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('issues');
                setStatusFilter('all');
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === 'issues'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <ListTodo className="h-4 w-4" />
              <span>Active Issues ({activeIssues.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('backlog');
                setStatusFilter('all');
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === 'backlog'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Backlog ({backlogIssues.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sprints')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === 'sprints'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sprints ({sprints.length})</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          {activeTab !== 'sprints' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari task / issue..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-950 text-[11px]">
                <Filter className="h-3 w-3 text-slate-400 ml-1" />
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('open')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    statusFilter === 'open'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('in_progress')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    statusFilter === 'in_progress'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Progress
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('closed')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                    statusFilter === 'closed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span>Memuat data lengkap dari Jira Agile Board...</span>
            </div>
          </div>
        ) : activeTab === 'issues' || activeTab === 'backlog' ? (
          filteredList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Key</th>
                    <th className="pb-3">Judul / Task Summary</th>
                    <th className="pb-3">Tipe</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Assignee</th>
                    <th className="pb-3">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredList.map((item) => {
                    const statusName = item.fields.status?.name || 'Open';
                    const statusLower = statusName.toLowerCase();
                    const isDone =
                      statusLower.includes('done') ||
                      statusLower.includes('closed') ||
                      statusLower.includes('resolved');
                    const isInProgress =
                      statusLower.includes('progress') ||
                      statusLower.includes('review') ||
                      statusLower.includes('test');

                    const statusColor = isDone
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : isInProgress
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';

                    const directUrl = jiraConfig?.host
                      ? `${jiraConfig.host}/browse/${item.key}`
                      : `https://atlassian.net/browse/${item.key}`;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          <a
                            href={directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline inline-flex items-center gap-1"
                          >
                            <span>{item.key}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="py-3 font-medium text-slate-900 dark:text-slate-100 max-w-lg">
                          {item.fields.summary}
                        </td>
                        <td className="py-3">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.fields.issuetype?.name || 'Task'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 ${statusColor}`}
                          >
                            <span>{isDone ? '🟢' : isInProgress ? '🟡' : '🔴'}</span>
                            <span>{statusName}</span>
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-600 dark:text-slate-400">
                          {item.fields.priority?.name || 'Medium'}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.fields.assignee?.displayName || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-500 font-mono text-[11px]">
                          {item.fields.duedate ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{new Date(item.fields.duedate).toLocaleDateString('id-ID')}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Tidak ada issue yang sesuai dengan kriteria filter.
            </div>
          )
        ) : (
          // Sprints Tab
          <div className="space-y-4">
            {sprints.length > 0 ? (
              sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {sprint.name}
                      </h4>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          sprint.state === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : sprint.state === 'future'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {sprint.state}
                      </span>
                    </div>
                    {sprint.goal && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                        🎯 {sprint.goal}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-slate-500 font-mono space-y-0.5">
                    {sprint.startDate && (
                      <div>Mulai: {new Date(sprint.startDate).toLocaleDateString('id-ID')}</div>
                    )}
                    {sprint.endDate && (
                      <div>Selesai: {new Date(sprint.endDate).toLocaleDateString('id-ID')}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                Tidak ada sprint yang terdaftar pada board ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
