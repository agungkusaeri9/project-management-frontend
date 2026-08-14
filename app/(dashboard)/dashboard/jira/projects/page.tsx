'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Kanban,
  RefreshCw,
  ExternalLink,
  Settings,
  AlertCircle,
  FolderGit2,
  ListTodo,
  Search,
  CheckCircle2,
  Database,
  ChevronLeft,
  ChevronRight,
  Filter,
  Link2,
  Unlink,
  Building2,
  Calendar,
  X,
  Check,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  jiraService,
  JiraProjectRecord,
  JiraConfigData,
} from '@/features/jira/services/jira.service';
import { projectService, Project } from '@/features/project/services/project.service';

export default function JiraProjectsPage() {
  const [projects, setProjects] = useState<JiraProjectRecord[]>([]);
  const [internalProjects, setInternalProjects] = useState<Project[]>([]);
  const [jiraConfig, setJiraConfig] = useState<JiraConfigData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [linkFilter, setLinkFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Assign Project Modal State
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [selectedJiraProject, setSelectedJiraProject] = useState<JiraProjectRecord | null>(null);
  const [selectedInternalProjectId, setSelectedInternalProjectId] = useState<string>('');
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [linkSuccessMessage, setLinkSuccessMessage] = useState<string | null>(null);

  // Load Jira Projects and Master Internal Projects on mount
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [configRes, projectsRes, internalProjectsRes] = await Promise.allSettled([
          jiraService.getConfig(),
          jiraService.getProjects(),
          projectService.getAll(),
        ]);

        if (!ignore) {
          if (configRes.status === 'fulfilled' && configRes.value) {
            setJiraConfig(configRes.value);
          }

          if (projectsRes.status === 'fulfilled' && projectsRes.value) {
            const values = projectsRes.value.values || [];
            setProjects(values);
          } else if (projectsRes.status === 'rejected') {
            const err = projectsRes.reason;
            const msg = err instanceof Error ? err.message : 'Gagal memuat daftar project Jira dari database';
            setErrorMessage(msg);
          }

          if (internalProjectsRes.status === 'fulfilled' && internalProjectsRes.value) {
            setInternalProjects(internalProjectsRes.value);
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
  }, []);

  const handleRefreshAndSync = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage(null);
      setSyncNotification(null);

      // Trigger live sync to PostgreSQL jira_projects table
      let values: JiraProjectRecord[] = [];
      try {
        const res = await jiraService.syncProjects();
        values = res.values || [];
      } catch {
        const res = await jiraService.getProjects();
        values = res.values || [];
      }

      setProjects(values);
      setCurrentPage(1);
      setSyncNotification(
        `Database PostgreSQL berhasil diperbarui! ${values.length} Jira Projects & Boards tersinkronisasi.`
      );
      setTimeout(() => setSyncNotification(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal merefresh dan menyinkronkan data Jira ke database';
      setErrorMessage(msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Open Assign Modal for a Jira Project
  const handleOpenAssignModal = (jiraProject: JiraProjectRecord) => {
    setSelectedJiraProject(jiraProject);
    setSelectedInternalProjectId(jiraProject.project_id || '');
    setLinkSuccessMessage(null);
    setAssignModalOpen(true);
  };

  // Save Project Link Assignment
  const handleSaveProjectLink = async () => {
    if (!selectedJiraProject) return;

    try {
      setIsLinking(true);
      const targetProjectId = selectedInternalProjectId.trim() || null;
      await jiraService.linkProject(selectedJiraProject.id, targetProjectId);

      // Find internal project details to update local UI state immediately
      const linkedProject = targetProjectId ? internalProjects.find((p) => p.id === targetProjectId) : null;

      setProjects((prev) =>
        prev.map((item) => {
          if (item.id === selectedJiraProject.id) {
            return {
              ...item,
              project_id: targetProjectId,
              internal_project_name: linkedProject ? linkedProject.name : null,
              internal_project_code: linkedProject ? linkedProject.code : null,
              internal_customer_name: linkedProject ? linkedProject.customer_name : null,
            };
          }
          return item;
        })
      );

      const successText = targetProjectId
        ? `Jira project "${selectedJiraProject.board_name}" berhasil dihubungkan ke project "${linkedProject?.name || ''}"`
        : `Tautan project internal untuk "${selectedJiraProject.board_name}" berhasil dilepas.`;

      setSyncNotification(successText);
      setTimeout(() => setSyncNotification(null), 5000);
      setAssignModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan tautan project';
      setErrorMessage(msg);
    } finally {
      setIsLinking(false);
    }
  };

  // Selected Internal Project object for detail preview inside modal
  const activeSelectedProjectDetail = useMemo(() => {
    if (!selectedInternalProjectId) return null;
    return internalProjects.find((p) => p.id === selectedInternalProjectId) || null;
  }, [selectedInternalProjectId, internalProjects]);

  // Filter projects by search query, type, and link status
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.project_name?.toLowerCase().includes(q);
      const keyMatch = p.project_key?.toLowerCase().includes(q);
      const bNameMatch = p.board_name?.toLowerCase().includes(q);
      const dNameMatch = p.display_name?.toLowerCase().includes(q);
      const internalNameMatch = p.internal_project_name?.toLowerCase().includes(q);
      const internalCustomerMatch = p.internal_customer_name?.toLowerCase().includes(q);
      const matchesSearch = nameMatch || keyMatch || bNameMatch || dNameMatch || internalNameMatch || internalCustomerMatch;

      if (!matchesSearch) return false;

      // Link Filter
      if (linkFilter === 'linked' && !p.project_id) return false;
      if (linkFilter === 'unlinked' && p.project_id) return false;

      // Type Filter
      if (typeFilter === 'all') return true;
      const boardType = p.board_type?.toLowerCase() || '';
      const pType = p.project_type_key?.toLowerCase() || '';
      return boardType.includes(typeFilter.toLowerCase()) || pType.includes(typeFilter.toLowerCase());
    });
  }, [projects, searchQuery, typeFilter, linkFilter]);

  // Paginated Data
  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
            <Kanban className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Jira Projects &amp; Agile Boards
              </h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                {projects.length} di Database
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daftar project dan agile board Jira yang terhubung ke database dan project internal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshAndSync}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Menyinkronkan DB...' : 'Refresh & Sync DB'}</span>
          </button>

          <Link
            href="/dashboard/settings/jira"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Konfigurasi Jira</span>
          </Link>
        </div>
      </div>

      {/* Sync Success Alert */}
      {syncNotification && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-xs dark:border-emerald-950/60 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in slide-in-from-top-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="flex-1 flex items-center justify-between gap-2">
            <span>{syncNotification}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-200/80 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-200">
              <Database className="h-3 w-3" />
              <span>PostgreSQL Ready</span>
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 dark:border-red-950/60 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">
            {errorMessage}
            <div className="mt-1 text-[11px] text-red-700 dark:text-red-400">
              Pastikan kredensial Jira telah dikonfigurasi di menu{' '}
              <Link href="/dashboard/settings/jira" className="underline font-bold">
                Konfigurasi Jira
              </Link>
              .
            </div>
          </div>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Search & Filter Header Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari project Jira atau project internal..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 shadow-2xs"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-950 text-xs w-full sm:w-auto overflow-x-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5 shrink-0" />
              {['all', 'software', 'scrum', 'simple'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTypeFilter(t);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize transition-colors whitespace-nowrap ${
                    typeFilter === t
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t === 'all' ? 'Semua Tipe' : t}
                </button>
              ))}
            </div>

            {/* Link Status Filter */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-slate-950 text-xs w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all', label: 'Semua Status' },
                { id: 'linked', label: 'Terkait' },
                { id: 'unlinked', label: 'Belum Terkait' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setLinkFilter(l.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors whitespace-nowrap ${
                    linkFilter === l.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rows Per Page Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500 self-end lg:self-center">
            <span>Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span>Memuat data project dari database PostgreSQL...</span>
            </div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 pl-6 pr-3 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Project &amp; Agile Board</th>
                  <th className="py-3.5 px-4">Project Key</th>
                  <th className="py-3.5 px-4">Board ID &amp; Tipe</th>
                  <th className="py-3.5 px-4">Project Internal (Tersambung)</th>
                  <th className="py-3.5 px-4">Terakhir Sync</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {paginatedProjects.map((item, index) => {
                  const sequenceNumber = (currentPage - 1) * pageSize + index + 1;
                  const projectKey = item.project_key || 'JIRA';
                  const projectName = item.display_name || item.project_name || item.board_name;
                  const boardName = item.board_name;
                  const boardId = item.jira_board_id;
                  const projectType = item.project_type_key || item.board_type || 'software';

                  const jiraWebUrl = jiraConfig?.host
                    ? `${jiraConfig.host}/jira/software/projects/${projectKey}/boards/${boardId}`
                    : `https://atlassian.net/jira/software/projects/${projectKey}/boards/${boardId}`;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Number */}
                      <td className="py-4 pl-6 pr-3 text-center font-mono text-slate-400 font-medium text-xs">
                        {sequenceNumber}
                      </td>

                      {/* Project & Board Name */}
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          {item.avatar_uri ? (
                            <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.avatar_uri}
                                alt={projectName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900 shrink-0">
                              <FolderGit2 className="h-5 w-5" />
                            </div>
                          )}

                          <div className="space-y-0.5">
                            <Link
                              href={`/dashboard/jira/projects/${boardId}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 block text-sm"
                            >
                              {projectName}
                            </Link>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Kanban className="h-3 w-3 text-slate-400" />
                              <span>{boardName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Project Key */}
                      <td className="py-4 px-4">
                        <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-mono font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                          {projectKey}
                        </span>
                      </td>

                      {/* Board ID & Type */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
                          #{boardId}
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 capitalize inline-block">
                          {projectType}
                        </span>
                      </td>

                      {/* Internal Project Linked */}
                      <td className="py-4 px-4">
                        {item.project_id ? (
                          <div className="space-y-1 max-w-xs">
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 dark:border-indigo-900 dark:bg-indigo-950/40 px-2.5 py-1 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                              <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <span className="truncate max-w-[160px]">
                                {item.internal_project_name || 'Project Internal'}
                              </span>
                            </div>
                            {item.internal_customer_name && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pl-1">
                                <Briefcase className="h-3 w-3 text-slate-400" />
                                <span className="truncate">{item.internal_customer_name}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
                          >
                            <Link2 className="h-3 w-3" />
                            <span>+ Assign Project</span>
                          </button>
                        )}
                      </td>

                      {/* Last Synced */}
                      <td className="py-4 px-4 text-[11px] text-slate-500 font-mono">
                        {item.last_synced_at ? (
                          new Date(item.last_synced_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Project Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(item)}
                            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                              item.project_id
                                ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/40'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            title={item.project_id ? 'Ubah Tautan Project Internal' : 'Hubungkan ke Project Internal'}
                          >
                            <Link2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>{item.project_id ? 'Ubah Project' : 'Assign'}</span>
                          </button>

                          {/* Detail Board */}
                          <Link
                            href={`/dashboard/jira/projects/${boardId}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-600 dark:hover:text-white transition-colors shadow-2xs"
                          >
                            <ListTodo className="h-3.5 w-3.5" />
                            <span>Detail</span>
                          </Link>

                          {/* Live Jira Link */}
                          <a
                            href={jiraWebUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                            title="Buka Board di Jira Cloud"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Database className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">
              Belum ada project Jira yang tersimpan di database
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Klik tombol &quot;Refresh &amp; Sync DB&quot; untuk menyinkronkan daftar board dari Jira Cloud ke database PostgreSQL Anda.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleRefreshAndSync}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Sync Projects dari Jira Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {/* Table Pagination Footer */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
            <div className="text-slate-500">
              Menampilkan{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              sampai{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {Math.min(currentPage * pageSize, filteredProjects.length)}
              </span>{' '}
              dari{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {filteredProjects.length}
              </span>{' '}
              project
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 self-center">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* Assign Project Modal                                      */}
      {/* ========================================================= */}
      {assignModalOpen && selectedJiraProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Assign Jira ke Project Internal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hubungkan board Jira ini dengan salah satu master project yang terdaftar di sistem
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Jira Project Summary Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Jira Project &amp; Board
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-mono font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {selectedJiraProject.project_key}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {selectedJiraProject.board_name}
                  </span>
                </div>
                <span className="rounded bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize">
                  Board #{selectedJiraProject.jira_board_id} ({selectedJiraProject.board_type})
                </span>
              </div>
            </div>

            {/* Project Selection Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Master Project Internal:
              </label>
              <select
                value={selectedInternalProjectId}
                onChange={(e) => setSelectedInternalProjectId(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 shadow-2xs"
              >
                <option value="">-- Tidak Ditautkan (Lepaskan Tautan) --</option>
                {internalProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} {p.customer_name ? `• Customer: ${p.customer_name}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Internal Project Detailed Preview Card */}
            {activeSelectedProjectDetail ? (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4.5 dark:border-indigo-900/60 dark:bg-indigo-950/30 space-y-3.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Detail Project Internal Terpilih
                    </span>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-300">
                    {activeSelectedProjectDetail.code}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Project Name */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-medium">Nama Project:</span>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {activeSelectedProjectDetail.name}
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-medium">Klien / Customer:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      <span>{activeSelectedProjectDetail.customer_name || 'Tidak ada customer'}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-medium">Status Project:</span>
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 capitalize border border-emerald-200 dark:border-emerald-900">
                        <Check className="h-3 w-3" />
                        <span>{activeSelectedProjectDetail.status || 'Active'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-medium">Periode / Timeline:</span>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {activeSelectedProjectDetail.start_date
                          ? new Date(activeSelectedProjectDetail.start_date).toLocaleDateString('id-ID')
                          : '-'}{' '}
                        s/d{' '}
                        {activeSelectedProjectDetail.end_date
                          ? new Date(activeSelectedProjectDetail.end_date).toLocaleDateString('id-ID')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {activeSelectedProjectDetail.description && (
                  <div className="pt-2 border-t border-indigo-100/70 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Deskripsi: </span>
                    {activeSelectedProjectDetail.description}
                  </div>
                )}
              </div>
            ) : selectedInternalProjectId === '' && selectedJiraProject.project_id ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2">
                <Unlink className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Memilih opsi ini akan <strong>melepaskan tautan</strong> project internal saat ini (
                  {selectedJiraProject.internal_project_name || 'Project Terkait'}).
                </div>
              </div>
            ) : null}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                disabled={isLinking}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveProjectLink}
                disabled={isLinking}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isLinking ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Simpan Hubungan Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
