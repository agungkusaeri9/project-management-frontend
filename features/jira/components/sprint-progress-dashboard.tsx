'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Kanban,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Clock,
  User,
  Search,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Flame,
} from 'lucide-react';
import {
  jiraService,
  JiraProgressSummaryResponse,
} from '@/features/jira/services/jira.service';

export function SprintProgressDashboard({ isDashboard = false }: { isDashboard?: boolean }) {
  const [data, setData] = useState<JiraProgressSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<
    'all' | 'unresolved' | 'in_sprint' | 'due_soon' | 'overdue' | 'backlog' | 'completed'
  >('unresolved');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const res = await jiraService.getProgressSummary();
        if (!ignore) {
          setData(res);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat progress sprint Jira';
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
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage(null);
      // Trigger sync and reload progress summary
      try {
        await jiraService.syncProjects();
      } catch {
        // Continue
      }
      const res = await jiraService.getProgressSummary();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal merefresh data progress';
      setErrorMessage(msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  const stats = data?.stats || {
    total_issues: 0,
    total_unresolved: 0,
    total_completed: 0,
    total_in_progress: 0,
    total_open: 0,
    total_active_sprint_unresolved: 0,
    total_backlog_unresolved: 0,
    total_overdue: 0,
    total_due_soon: 0,
  };

  const rawIssues = useMemo(() => data?.issues || [], [data?.issues]);
  const projects = data?.projects || [];

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    return rawIssues.filter((item) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.issue_key?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.assignee?.toLowerCase().includes(q) ||
        item.project_key?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Project Filter
      if (selectedProject !== 'all' && item.project_key !== selectedProject) {
        return false;
      }

      // 3. Tab Filter
      const isClosed = item.status === 'closed';

      if (activeTab === 'completed') return isClosed;
      if (activeTab === 'unresolved') return !isClosed;
      if (activeTab === 'in_sprint') return !isClosed && !item.is_backlog;
      if (activeTab === 'backlog') return !isClosed && item.is_backlog;

      if (activeTab === 'overdue') {
        if (isClosed || !item.due_date) return false;
        const dDate = new Date(item.due_date);
        return dDate < today;
      }

      if (activeTab === 'due_soon') {
        if (isClosed || !item.due_date) return false;
        const dDate = new Date(item.due_date);
        return dDate >= today && dDate <= sevenDaysLater;
      }

      return true;
    });
  }, [rawIssues, searchQuery, selectedProject, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / pageSize) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIssues.slice(start, start + pageSize);
  }, [filteredIssues, currentPage, pageSize]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Sprint &amp; Task Progress Overview
              </h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Live DB Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ringkasan task Jira yang belum selesai, task aktif dalam rentang sprint, dan deadline due date
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Menyinkronkan...' : 'Refresh Progress'}</span>
          </button>

          <Link
            href="/dashboard/jira/projects"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Jira Projects</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 dark:border-red-950/60 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Task Belum Selesai (Not Done) */}
        <div
          onClick={() => {
            setActiveTab('unresolved');
            setCurrentPage(1);
          }}
          className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 shadow-2xs hover:-translate-y-1 ${
            activeTab === 'unresolved'
              ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500/80 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Task Belum Selesai
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              {stats.total_unresolved}
            </span>
            <span className="text-[11px] text-slate-500">task aktif</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>🔴 {stats.total_open} To Do</span>
            <span>•</span>
            <span>🟡 {stats.total_in_progress} Progress</span>
          </div>
        </div>

        {/* Card 2: Masih dalam Rentang Waktu Sprint */}
        <div
          onClick={() => {
            setActiveTab('in_sprint');
            setCurrentPage(1);
          }}
          className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 shadow-2xs hover:-translate-y-1 ${
            activeTab === 'in_sprint'
              ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-500/80 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Dalam Waktu Sprint
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              {stats.total_active_sprint_unresolved}
            </span>
            <span className="text-[11px] text-slate-500">task di active sprint</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>📦 {stats.total_backlog_unresolved} di Backlog</span>
          </div>
        </div>

        {/* Card 3: Mendekati Due Date (<= 7 Hari) */}
        <div
          onClick={() => {
            setActiveTab('due_soon');
            setCurrentPage(1);
          }}
          className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 shadow-2xs hover:-translate-y-1 ${
            activeTab === 'due_soon'
              ? 'border-amber-500 bg-amber-50/50 dark:border-amber-500/80 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Mendekati Due Date
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              {stats.total_due_soon}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              &le; 7 hari ke depan
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Perlu atensi sebelum sprint berakhir
          </div>
        </div>

        {/* Card 4: Overdue (Melewati Due Date) */}
        <div
          onClick={() => {
            setActiveTab('overdue');
            setCurrentPage(1);
          }}
          className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 shadow-2xs hover:-translate-y-1 ${
            activeTab === 'overdue'
              ? 'border-red-500 bg-red-50/50 dark:border-red-500/80 dark:bg-red-950/30 ring-2 ring-red-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Overdue / Terlambat
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">
              {stats.total_overdue}
            </span>
            <span className="text-[11px] text-red-500">melewati deadline</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.total_overdue > 0 ? '⚠️ Butuh eskalasi PIC' : '✅ Semua task on track'}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-5 pt-3 bg-slate-50/60 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {[
              { id: 'unresolved', label: 'Belum Selesai', count: stats.total_unresolved },
              { id: 'in_sprint', label: 'Dalam Sprint', count: stats.total_active_sprint_unresolved },
              { id: 'due_soon', label: 'Mendekati Due Date', count: stats.total_due_soon },
              { id: 'overdue', label: 'Overdue', count: stats.total_overdue },
              { id: 'backlog', label: 'Backlog', count: stats.total_backlog_unresolved },
              { id: 'completed', label: 'Selesai (Done)', count: stats.total_completed },
              { id: 'all', label: 'Semua Task', count: stats.total_issues },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Project Dropdown Filter */}
          <div className="flex items-center gap-2 pb-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Filter Project:</span>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 shadow-2xs font-semibold"
            >
              <option value="all">Semua Project Jira</option>
              {projects.map((p) => (
                <option key={p.id} value={p.project_key}>
                  {p.project_key} - {p.project_name || p.board_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar & Page Size */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari task key (TTS-12), summary, assignee..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-center">
            <span>Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 shadow-2xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Issues Table */}
        {isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Memuat data task Jira dari database PostgreSQL...</span>
            </div>
          </div>
        ) : paginatedIssues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 pl-6 pr-3 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Key</th>
                  <th className="py-3.5 px-4">Summary Task</th>
                  <th className="py-3.5 px-4">Tipe &amp; Prioritas</th>
                  <th className="py-3.5 px-4">Status &amp; Sprint</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {paginatedIssues.map((issue, index) => {
                  const seq = (currentPage - 1) * pageSize + index + 1;
                  const isClosed = issue.status === 'closed';

                  // Due date calculations
                  let isOverdue = false;
                  let isDueSoon = false;
                  if (issue.due_date && !isClosed) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const sevenDays = new Date(today);
                    sevenDays.setDate(sevenDays.getDate() + 7);
                    const dDate = new Date(issue.due_date);
                    if (dDate < today) isOverdue = true;
                    else if (dDate <= sevenDays) isDueSoon = true;
                  }

                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* No */}
                      <td className="py-3.5 pl-6 pr-3 text-center font-mono text-slate-400 font-medium text-xs">
                        {seq}
                      </td>

                      {/* Key */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-mono font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                          {issue.issue_key}
                        </span>
                      </td>

                      {/* Summary */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                          {issue.summary}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Project Key: <span className="font-mono">{issue.project_key}</span>
                        </div>
                      </td>

                      {/* Type & Priority */}
                      <td className="py-3.5 px-4 space-y-1">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase inline-block">
                          {issue.issue_type || 'Task'}
                        </span>
                        {issue.priority && (
                          <div className="text-[11px] text-slate-500 font-medium capitalize">
                            Prio: {issue.priority}
                          </div>
                        )}
                      </td>

                      {/* Status & Sprint */}
                      <td className="py-3.5 px-4 space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            issue.status === 'closed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : issue.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {issue.raw_status || issue.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {issue.is_backlog ? (
                            <span className="text-slate-400 italic">Backlog</span>
                          ) : (
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              In Active Sprint
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {issue.assignee_avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={issue.assignee_avatar}
                              alt={issue.assignee || 'Avatar'}
                              className="h-6 w-6 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                              <User className="h-3 w-3" />
                            </div>
                          )}
                          <div className="truncate max-w-[120px]">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {issue.assignee || 'Unassigned'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4">
                        {issue.due_date ? (
                          <div className="space-y-0.5">
                            <div
                              className={`text-xs font-mono font-bold ${
                                isOverdue
                                  ? 'text-red-600 dark:text-red-400'
                                  : isDueSoon
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {new Date(issue.due_date).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            {isOverdue && (
                              <span className="rounded bg-red-100 px-1.5 py-0.2 text-[9px] font-bold text-red-700 dark:bg-red-950/80 dark:text-red-300 block w-fit">
                                Terlambat
                              </span>
                            )}
                            {isDueSoon && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 block w-fit">
                                Segera
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {issue.jira_board_id && (
                            <Link
                              href={`/dashboard/jira/projects/${issue.jira_board_id}`}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 shadow-2xs transition-colors"
                              title="Buka Board Detail"
                            >
                              <Kanban className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          {issue.url && (
                            <a
                              href={issue.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 shadow-2xs transition-colors"
                              title="Buka Issue di Jira Cloud"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Tidak ada task ditemukan
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Coba ganti filter kategori atau kata kunci pencarian Anda.
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredIssues.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40 dark:bg-slate-950/20">
            <div>
              Menampilkan{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              hingga{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {Math.min(currentPage * pageSize, filteredIssues.length)}
              </span>{' '}
              dari{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {filteredIssues.length}
              </span>{' '}
              task
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </button>

              <span className="px-3 py-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <span>Berikutnya</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
