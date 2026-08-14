'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Container,
  RefreshCw,
  Search,
  Settings,
  Terminal,
  Activity,
  Play,
  Square,
  RotateCw,
  Server,
  Cpu,
  HardDrive,
  Network,
  List,
  LayoutGrid,
  Check,
  Copy,
  ExternalLink,
  AlertTriangle,
  X,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  dockerService,
  DockerContainerItem,
  DockerStatsResponse
} from '@/features/docker/services/docker.service';

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DockerContainersPage() {
  // Data state
  const [containers, setContainers] = useState<DockerContainerItem[]>([]);
  const [dockerHost, setDockerHost] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-refresh state (Default: 0 = Off / Manual)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Logs Modal State
  const [selectedContainerForLogs, setSelectedContainerForLogs] = useState<DockerContainerItem | null>(null);
  const [logsContent, setLogsContent] = useState<string>('');
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [logsTail, setLogsTail] = useState<number>(200);
  const [logsSearch, setLogsSearch] = useState<string>('');
  const [isCopiedLogs, setIsCopiedLogs] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Stats Modal State
  const [selectedContainerForStats, setSelectedContainerForStats] = useState<DockerContainerItem | null>(null);
  const [containerDetailedStats, setContainerDetailedStats] = useState<DockerStatsResponse | null>(null);
  const [isLoadingDetailedStats, setIsLoadingDetailedStats] = useState<boolean>(false);

  // Action Loading states (by container ID)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const hasLoadedOnce = useRef<boolean>(false);

  // Fetch Containers
  const fetchContainers = async (showToast: boolean = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      else if (!hasLoadedOnce.current) setIsLoading(true);
      setErrorMessage(null);

      const res = await dockerService.getContainers(true);
      setContainers(res.data || []);
      setDockerHost(res.host || '');
      hasLoadedOnce.current = true;

      if (showToast) {
        toast.success('Daftar Docker Container berhasil diperbarui!');
      }
    } catch (err: any) {
      console.error('Failed to fetch containers:', err);
      const msg = err.response?.data?.error || err.message || 'Gagal terhubung ke Docker Engine';
      setErrorMessage(msg);
      if (showToast) toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      fetchContainers(false);
    }, autoRefreshInterval * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefreshInterval]);

  // Filtered Containers
  const filteredContainers = useMemo(() => {
    return containers.filter((c) => {
      const matchSearch =
        searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.image.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.status.toLowerCase().includes(searchQuery.toLowerCase());

      const matchState =
        selectedState === 'all' ||
        (selectedState === 'running' && c.state === 'running') ||
        (selectedState === 'exited' && (c.state === 'exited' || c.state === 'dead')) ||
        (selectedState === 'other' && !['running', 'exited', 'dead'].includes(c.state));

      return matchSearch && matchState;
    });
  }, [containers, searchQuery, selectedState]);

  // Overall KPI Metrics
  const kpiStats = useMemo(() => {
    const running = containers.filter((c) => c.state === 'running').length;
    const exited = containers.filter((c) => c.state === 'exited' || c.state === 'dead').length;
    const other = containers.length - running - exited;

    let totalCpu = 0;
    let totalMem = 0;

    containers.forEach((c) => {
      if (c.state === 'running') {
        totalCpu += c.cpu_percent || 0;
        totalMem += c.memory_usage || 0;
      }
    });

    return {
      total: containers.length,
      running,
      exited,
      other,
      totalCpu: parseFloat(totalCpu.toFixed(1)),
      totalMemFormatted: formatBytes(totalMem),
    };
  }, [containers]);

  // Handle Container Actions (Start / Stop / Restart)
  const handleContainerAction = async (id: string, name: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoadingId(id);
    try {
      if (action === 'start') {
        await dockerService.startContainer(id);
        toast.success(`Container "${name}" berhasil dijalankan (Started)!`);
      } else if (action === 'stop') {
        await dockerService.stopContainer(id);
        toast.success(`Container "${name}" berhasil dihentikan (Stopped)!`);
      } else if (action === 'restart') {
        await dockerService.restartContainer(id);
        toast.success(`Container "${name}" berhasil di-restart!`);
      }
      fetchContainers(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || `Gagal melakukan ${action} container`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Logs Modal
  const handleOpenLogs = async (container: DockerContainerItem) => {
    setSelectedContainerForLogs(container);
    setLogsContent('');
    setIsLoadingLogs(true);

    try {
      const res = await dockerService.getContainerLogs(container.id, logsTail);
      setLogsContent(res.data || 'Tidak ada log yang tercatat.');
    } catch (err: any) {
      setLogsContent('Gagal memuat log: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Refresh Logs in Modal
  const handleRefreshLogs = async () => {
    if (!selectedContainerForLogs) return;
    setIsLoadingLogs(true);
    try {
      const res = await dockerService.getContainerLogs(selectedContainerForLogs.id, logsTail);
      setLogsContent(res.data || 'Tidak ada log yang tercatat.');
    } catch (err: any) {
      setLogsContent('Gagal memuat log: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Copy Logs to Clipboard
  const handleCopyLogs = () => {
    if (!logsContent) return;
    navigator.clipboard.writeText(logsContent);
    setIsCopiedLogs(true);
    toast.success('Log container berhasil disalin ke clipboard!');
    setTimeout(() => setIsCopiedLogs(false), 2500);
  };

  // Open Stats Modal
  const handleOpenStats = async (container: DockerContainerItem) => {
    setSelectedContainerForStats(container);
    setContainerDetailedStats(null);
    setIsLoadingDetailedStats(true);

    try {
      const stats = await dockerService.getContainerStats(container.id);
      setContainerDetailedStats(stats);
    } catch (err: any) {
      toast.error('Gagal memuat detail resource stats: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoadingDetailedStats(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
              <Container className="h-3.5 w-3.5 text-sky-400" />
              <span>Docker Integration</span>
            </span>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              Live Monitoring
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Docker Container Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau status operasional container, penggunaan CPU/RAM secara real-time, dan log terminal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Auto Refresh Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs shadow-2xs">
            <span className="text-slate-400 font-medium">Auto-Refresh:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value={3}>3 detik</option>
              <option value={5}>5 detik</option>
              <option value={10}>10 detik</option>
              <option value={30}>30 detik</option>
              <option value={0}>Mati (Manual)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchContainers(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>

          <Link
            href="/dashboard/settings/docker"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2 text-xs font-bold shadow-2xs hover:opacity-90 transition-opacity"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Konfigurasi Docker</span>
          </Link>
        </div>
      </div>

      {/* Error / Offline Notice */}
      {errorMessage && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Tidak dapat terhubung ke Docker Engine Daemon</h4>
            <p className="leading-relaxed opacity-90">
              {errorMessage}. Pastikan service Docker / Docker Desktop di komputer/server Anda sedang aktif. Anda juga dapat menyesuaikan Docker Host di halaman <Link href="/dashboard/settings/docker" className="underline font-bold">Konfigurasi Docker</Link>.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Running Containers */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs dark:border-emerald-950/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              Container Berjalan
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {kpiStats.running}
            </span>
            <span className="text-[10px] text-emerald-600">dari {kpiStats.total} container</span>
          </div>
        </div>

        {/* Stopped / Exited Containers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Berhenti / Exited
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Square className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {kpiStats.exited}
            </span>
            <span className="text-[10px] text-slate-400">container</span>
          </div>
        </div>

        {/* Total CPU Usage */}
        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/40 p-4 shadow-2xs dark:border-sky-950/60 dark:bg-sky-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-sky-800 dark:text-sky-400 uppercase tracking-wider">
              Total CPU Load
            </span>
            <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-sky-700 dark:text-sky-300">
              {kpiStats.totalCpu}%
            </span>
            <span className="text-[10px] text-sky-600">seluruh container</span>
          </div>
        </div>

        {/* Total Memory RAM */}
        <div className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-4 shadow-2xs dark:border-violet-950/60 dark:bg-violet-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-violet-800 dark:text-violet-400 uppercase tracking-wider">
              Total RAM Terpakai
            </span>
            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-violet-700 dark:text-violet-300">
              {kpiStats.totalMemFormatted}
            </span>
            <span className="text-[10px] text-violet-600">aktif</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-wrap bg-slate-50/50 dark:bg-slate-950/40">
          
          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama container, image, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Filters & View Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="all">Semua ({containers.length})</option>
                <option value="running">Berjalan ({kpiStats.running})</option>
                <option value="exited">Berhenti ({kpiStats.exited})</option>
                <option value="other">Lainnya ({kpiStats.other})</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden p-0.5 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Tampilan Tabel"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Content Table or Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-sky-600 mb-2" />
            <span className="text-xs font-medium">Menghubungkan ke Docker Engine & memuat container...</span>
          </div>
        ) : filteredContainers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Container className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {errorMessage ? 'Gagal Terhubung ke Docker Engine' : 'Tidak Ada Container Ditemukan'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {errorMessage || 'Pastikan Docker Desktop aktif dan terdapat container yang telah dibuat.'}
              </p>
            </div>
            <Link
              href="/dashboard/settings/docker"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-2xs transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Buka Konfigurasi Docker Host</span>
            </Link>
          </div>
        ) : viewMode === 'table' ? (
          
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-5 py-3.5 w-10 text-center">Status</th>
                  <th className="px-5 py-3.5">Nama Container</th>
                  <th className="px-5 py-3.5">Image</th>
                  <th className="px-5 py-3.5">Ports & Mapping</th>
                  <th className="px-5 py-3.5 text-center">CPU %</th>
                  <th className="px-5 py-3.5 text-center">RAM Terpakai</th>
                  <th className="px-5 py-3.5">Uptime</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredContainers.map((c) => {
                  const isRunning = c.state === 'running';
                  const isExited = c.state === 'exited' || c.state === 'dead';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Status Icon */}
                      <td className="px-5 py-4 text-center">
                        {isRunning ? (
                          <span className="relative flex h-3 w-3 mx-auto" title="Running">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                          </span>
                        ) : isExited ? (
                          <span className="inline-block h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto" title="Exited / Stopped" />
                        ) : (
                          <span className="inline-block h-3 w-3 rounded-full bg-amber-400 mx-auto" title={c.state} />
                        )}
                      </td>

                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs block font-mono">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ID: {c.id.slice(0, 12)}
                          </span>
                        </div>
                      </td>

                      {/* Image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          <Container className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                          <span className="truncate max-w-[200px]" title={c.image}>
                            {c.image}
                          </span>
                        </div>
                      </td>

                      {/* Ports */}
                      <td className="px-5 py-4 max-w-[200px]">
                        {c.ports && c.ports.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.ports.slice(0, 2).map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {p.public_port ? `${p.public_port}:` : ''}{p.private_port}/{p.type}
                              </span>
                            ))}
                            {c.ports.length > 2 && (
                              <span className="text-[9px] text-slate-400 font-bold px-1">
                                +{c.ports.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* CPU % */}
                      <td className="px-5 py-4 text-center">
                        {isRunning ? (
                          <div className="space-y-1 min-w-[70px]">
                            <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                              {c.cpu_percent.toFixed(1)}%
                            </span>
                            <div className="w-16 mx-auto h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-sky-500 transition-all duration-300"
                                style={{ width: `${Math.min(c.cpu_percent, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">-</span>
                        )}
                      </td>

                      {/* RAM */}
                      <td className="px-5 py-4 text-center">
                        {isRunning ? (
                          <div className="space-y-1 min-w-[80px]">
                            <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                              {formatBytes(c.memory_usage)}
                            </span>
                            <div className="w-16 mx-auto h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-violet-500 transition-all duration-300"
                                style={{ width: `${Math.min(c.memory_percent, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">-</span>
                        )}
                      </td>

                      {/* Uptime / Status */}
                      <td className="px-5 py-4 text-slate-500">
                        <span className="text-[11px] font-medium" title={c.status}>
                          {c.status}
                        </span>
                      </td>

                      {/* Actions (Icon-only) */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Logs Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenLogs(c)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer"
                            title="Buka Terminal Live Logs"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>

                          {/* Stats Metric Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenStats(c)}
                            className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer"
                            title="Lihat Detail Statistik Resource"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>

                          {/* Restart Button */}
                          <button
                            type="button"
                            disabled={actionLoadingId === c.id}
                            onClick={() => handleContainerAction(c.id, c.name, 'restart')}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer disabled:opacity-50"
                            title="Restart Container"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${actionLoadingId === c.id ? 'animate-spin text-amber-600' : ''}`} />
                          </button>

                          {/* Start or Stop Button */}
                          {isRunning ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === c.id}
                              onClick={() => handleContainerAction(c.id, c.name, 'stop')}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer disabled:opacity-50"
                              title="Stop Container"
                            >
                              <Square className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoadingId === c.id}
                              onClick={() => handleContainerAction(c.id, c.name, 'start')}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer disabled:opacity-50"
                              title="Start Container"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
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
          
          /* GRID VIEW */
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredContainers.map((c) => {
              const isRunning = c.state === 'running';

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isRunning ? (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </span>
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                        )}
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs font-mono">
                          {c.name}
                        </h4>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          isRunning
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {c.state}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono line-clamp-1" title={c.image}>
                      Image: {c.image}
                    </p>

                    {isRunning && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="p-2 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40">
                          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold block">CPU</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{c.cpu_percent.toFixed(1)}%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40">
                          <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold block">RAM</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatBytes(c.memory_usage)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {c.id.slice(0, 10)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenLogs(c)}
                        className="p-1 text-slate-500 hover:text-sky-600 transition-colors"
                        title="Logs"
                      >
                        <Terminal className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStats(c)}
                        className="p-1 text-slate-500 hover:text-violet-600 transition-colors"
                        title="Stats"
                      >
                        <Activity className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === c.id}
                        onClick={() => handleContainerAction(c.id, c.name, 'restart')}
                        className="p-1 text-slate-500 hover:text-amber-600 transition-colors"
                        title="Restart"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">Docker Host: {dockerHost || 'Connected'}</span>
          </div>

          <div>
            Total {filteredContainers.length} container ditampilkan
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 📜 MODAL: DARK TERMINAL LIVE LOG VIEWER */}
      {/* ========================================================================= */}
      {selectedContainerForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div 
            className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Terminal className="h-4 w-4 text-sky-400" />
                  <span className="font-bold">{selectedContainerForLogs.name}</span>
                  <span className="text-slate-500 font-normal">({selectedContainerForLogs.id.slice(0, 12)})</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={logsTail}
                  onChange={(e) => {
                    setLogsTail(Number(e.target.value));
                    handleRefreshLogs();
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-[11px]"
                >
                  <option value={100}>100 baris</option>
                  <option value={200}>200 baris</option>
                  <option value={500}>500 baris</option>
                  <option value={1000}>1000 baris</option>
                </select>

                <button
                  type="button"
                  onClick={handleRefreshLogs}
                  disabled={isLoadingLogs}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Refresh Log"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLogs ? 'animate-spin text-sky-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Salin Semua Log"
                >
                  {isCopiedLogs ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedContainerForLogs(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed select-text space-y-1 max-h-[60vh]">
              {isLoadingLogs ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-sky-500 mx-auto" />
                  <p>Mengambil log dari Docker daemon...</p>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono break-all">
                  {logsContent}
                </pre>
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Terminal Footer */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[10px] text-slate-500 font-sans">
              <span className="font-mono text-slate-400">Stdout & Stderr multiplexed stream</span>
              <button
                type="button"
                onClick={() => setSelectedContainerForLogs(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
              >
                Tutup Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 MODAL: DETAILED CONTAINER STATS */}
      {/* ========================================================================= */}
      {selectedContainerForStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                    {selectedContainerForStats.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statistik pemakaian resource hardware real-time.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedContainerForStats(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isLoadingDetailedStats ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw className="h-7 w-7 animate-spin text-violet-600 mx-auto" />
                  <p className="text-xs">Menghitung metrik CPU & RAM...</p>
                </div>
              ) : containerDetailedStats ? (
                <div className="space-y-4">
                  {/* CPU & Memory Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400">CPU Usage</span>
                      <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-300 font-mono">
                        {containerDetailedStats.cpu_percent.toFixed(2)}%
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/40 dark:bg-violet-950/20 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-violet-700 dark:text-violet-400">RAM Usage</span>
                      <p className="text-2xl font-extrabold text-violet-600 dark:text-violet-300 font-mono">
                        {formatBytes(containerDetailedStats.memory_usage)}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Limit: {formatBytes(containerDetailedStats.memory_limit)} ({containerDetailedStats.memory_percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Network I/O */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Network className="h-4 w-4 text-emerald-500" />
                      <span>Network Bandwidth I/O</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Download (RX):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(containerDetailedStats.network_rx_bytes)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Upload (TX):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(containerDetailedStats.network_tx_bytes)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disk Block I/O & PIDs */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 font-mono">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Disk Read / Write</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formatBytes(containerDetailedStats.block_read_bytes)} / {formatBytes(containerDetailedStats.block_write_bytes)}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 font-mono">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Thread PIDs</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {containerDetailedStats.pids} active threads
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada data statistik untuk container ini.
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedContainerForStats(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
