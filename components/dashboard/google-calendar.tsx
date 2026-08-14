'use client';

import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isValid,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  differenceInCalendarDays,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Clock,
  Settings,
  Globe,
  RotateCcw,
  Check,
  List,
  Grid,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  CalendarRange,
} from 'lucide-react';
import { Project } from '@/features/project/services/project.service';
import { Issue } from '@/features/issue/services/issue.service';
import { JiraIntegrationModal } from '@/components/dashboard/jira-integration-modal';
import { SyncedJiraIssue } from '@/features/jira/services/jira.service';

export interface ProjectSpan {
  id: string;
  projectCode: string;
  projectName: string;
  customerName?: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

export type IssueStatusCategory = 'issue_open' | 'issue_in_progress' | 'issue_closed';

export interface IssueEvent {
  id: string;
  issueCode: string;
  title: string;
  date: Date;
  time: string;
  statusCategory: IssueStatusCategory;
  rawStatus: string;
  priority: string;
  projectName?: string;
  customerName?: string;
  description?: string;
}

export interface GoogleCalendarSource {
  id: string;
  name: string;
  calendarId: string;
  color: string;
  enabled: boolean;
}

const DEFAULT_CALENDAR_SOURCES: GoogleCalendarSource[] = [
  {
    id: 'cal-holidays',
    name: 'Hari Libur Nasional Indonesia',
    calendarId: 'id.indonesian#holiday@group.v.calendar.google.com',
    color: '#D50000', // Red
    enabled: true,
  },
];

const PRESET_COLORS = [
  { label: 'Biru', value: '#039BE5' },
  { label: 'Hijau', value: '#33B679' },
  { label: 'Ungu', value: '#8E24AA' },
  { label: 'Merah', value: '#D50000' },
  { label: 'Kuning / Oranye', value: '#F4511E' },
  { label: 'Tosca', value: '#00897B' },
  { label: 'Pink', value: '#E67C73' },
  { label: 'Abu-abu', value: '#616161' },
];

interface GoogleCalendarProps {
  projects?: Project[];
  issues?: Issue[];
}

export function GoogleCalendar({ projects = [], issues = [] }: GoogleCalendarProps) {
  // Active Tab: 'interactive' (Project Milestones & Issues) vs 'live' (Live Google Calendar Embed)
  const [activeTab, setActiveTab] = useState<'interactive' | 'live'>('interactive');

  // Multi-Calendar Sources state (persisted in localStorage)
  const [calendarSources, setCalendarSources] = useState<GoogleCalendarSource[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toho_google_calendar_sources');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_CALENDAR_SOURCES;
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Jira Integration State
  const [showJiraModal, setShowJiraModal] = useState<boolean>(false);
  const [jiraIssues, setJiraIssues] = useState<SyncedJiraIssue[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toho_jira_synced_issues');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return [];
  });

  // New Calendar Form State
  const [newCalName, setNewCalName] = useState<string>('');
  const [newCalId, setNewCalId] = useState<string>('');
  const [newCalColor, setNewCalColor] = useState<string>('#039BE5');

  // Interactive View States
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [filterType, setFilterType] = useState<
    'all' | 'projects' | 'issue_open' | 'issue_in_progress' | 'issue_closed'
  >('all');

  // Save calendar sources to localStorage
  const saveSources = (updated: GoogleCalendarSource[]) => {
    setCalendarSources(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('toho_google_calendar_sources', JSON.stringify(updated));
    }
  };

  // Toggle calendar enabled
  const toggleCalendar = (id: string) => {
    const updated = calendarSources.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    saveSources(updated);
  };

  // Add new calendar
  const handleAddCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalId.trim()) return;

    const newSource: GoogleCalendarSource = {
      id: `cal-${Date.now()}`,
      name: newCalName.trim() || newCalId.trim(),
      calendarId: newCalId.trim(),
      color: newCalColor,
      enabled: true,
    };

    const updated = [...calendarSources, newSource];
    saveSources(updated);
    setNewCalName('');
    setNewCalId('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  // Delete calendar
  const handleDeleteCalendar = (id: string) => {
    const updated = calendarSources.filter((c) => c.id !== id);
    saveSources(updated);
  };

  // Reset to default
  const handleResetDefault = () => {
    saveSources(DEFAULT_CALENDAR_SOURCES);
  };

  // Generate Multi-Calendar Google Calendar Embed URL
  const activeSources = calendarSources.filter((c) => c.enabled && c.calendarId.trim());
  const effectiveSources =
    activeSources.length > 0 ? activeSources : [DEFAULT_CALENDAR_SOURCES[0]];

  const googleCalendarEmbedUrl = (() => {
    const baseUrl = 'https://calendar.google.com/calendar/embed?';
    const params = new URLSearchParams();
    params.set('ctz', 'Asia/Jakarta');
    params.set('hl', 'id');
    params.set('showTitle', '0');
    params.set('showNav', '1');
    params.set('showDate', '1');
    params.set('showPrint', '0');
    params.set('showTabs', '1');
    params.set('showCalendars', effectiveSources.length > 1 ? '1' : '0');
    params.set('showTz', '1');

    let url = baseUrl + params.toString();
    effectiveSources.forEach((src) => {
      url += `&src=${encodeURIComponent(src.calendarId)}&color=${encodeURIComponent(src.color)}`;
    });
    return url;
  })();

  // 1. Process Projects into continuous Date Spans (Start Date -> End Date)
  const projectSpans: ProjectSpan[] = [];
  projects.forEach((proj) => {
    if (proj.start_date && proj.end_date) {
      const s = parseISO(proj.start_date);
      const e = parseISO(proj.end_date);
      if (isValid(s) && isValid(e)) {
        const totalDays = differenceInCalendarDays(e, s) + 1;
        projectSpans.push({
          id: proj.id,
          projectCode: proj.code,
          projectName: proj.name,
          customerName: proj.customer_name,
          status: proj.status,
          startDate: s,
          endDate: e,
          totalDays: totalDays > 0 ? totalDays : 1,
        });
      }
    } else if (proj.start_date && !proj.end_date) {
      const s = parseISO(proj.start_date);
      if (isValid(s)) {
        projectSpans.push({
          id: proj.id,
          projectCode: proj.code,
          projectName: proj.name,
          customerName: proj.customer_name,
          status: proj.status,
          startDate: s,
          endDate: s,
          totalDays: 1,
        });
      }
    }
  });

  // 2. Process Issues (Categorized by status: open, in_progress, closed)
  const issueEvents: IssueEvent[] = [];
  issues.forEach((iss) => {
    const rawDate = iss.issue_date || iss.created_at;
    if (rawDate) {
      const issueDate = parseISO(rawDate);
      if (isValid(issueDate)) {
        const timeStr = iss.created_at
          ? format(parseISO(iss.created_at), 'HH:mm') + ' WIB'
          : 'Sepanjang hari';

        const statusLower = (iss.status || 'open').toLowerCase();
        let statusCategory: IssueStatusCategory = 'issue_open';
        if (statusLower === 'closed' || statusLower === 'close' || statusLower === 'resolved') {
          statusCategory = 'issue_closed';
        } else if (
          statusLower === 'in_progress' ||
          statusLower === 'in progress' ||
          statusLower === 'testing'
        ) {
          statusCategory = 'issue_in_progress';
        }

        issueEvents.push({
          id: iss.id,
          issueCode: iss.issue_code,
          title: `Issue: ${iss.issue_code} ${iss.feature_name ? `- ${iss.feature_name}` : ''}`,
          date: issueDate,
          time: timeStr,
          statusCategory,
          rawStatus: iss.status,
          priority: iss.priority,
          projectName: iss.project_name || undefined,
          customerName: iss.customer_name || undefined,
          description: `Issue: ${iss.priority?.toUpperCase()} Priority &bull; Status: ${iss.status?.toUpperCase()}`,
        });
      }
    }
  });

  // 3. Process Synced Jira Issues
  jiraIssues.forEach((jIss) => {
    const rawDate = jIss.created_at;
    if (rawDate) {
      const issueDate = parseISO(rawDate);
      if (isValid(issueDate)) {
        const timeStr = format(issueDate, 'HH:mm') + ' WIB';
        const statusCategory: IssueStatusCategory =
          jIss.status === 'closed'
            ? 'issue_closed'
            : jIss.status === 'in_progress'
            ? 'issue_in_progress'
            : 'issue_open';

        issueEvents.push({
          id: `jira-${jIss.key}`,
          issueCode: jIss.key,
          title: `Jira: ${jIss.key} - ${jIss.summary}`,
          date: issueDate,
          time: timeStr,
          statusCategory,
          rawStatus: jIss.raw_status,
          priority: jIss.priority,
          description: `Jira ${jIss.issue_type} • Assignee: ${jIss.assignee} • Status: ${jIss.raw_status}`,
        });
      }
    }
  });

  // Calendar Interval calculation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Helper to get active project spans on a specific day
  const getActiveProjectSpansForDay = (day: Date) => {
    if (filterType !== 'all' && filterType !== 'projects') return [];
    return projectSpans.filter((proj) =>
      isWithinInterval(startOfDay(day), {
        start: startOfDay(proj.startDate),
        end: endOfDay(proj.endDate),
      })
    );
  };

  // Helper to get issue events on a specific day
  const getIssuesForDay = (day: Date) => {
    return issueEvents.filter((iss) => {
      const matchesDay = isSameDay(iss.date, day);
      if (!matchesDay) return false;
      if (filterType === 'all') return true;
      return filterType === iss.statusCategory;
    });
  };

  // Selected Day data
  const selectedDayProjects = projectSpans.filter((proj) =>
    isWithinInterval(startOfDay(selectedDate), {
      start: startOfDay(proj.startDate),
      end: endOfDay(proj.endDate),
    })
  );
  const selectedDayIssues = issueEvents.filter((iss) => isSameDay(iss.date, selectedDate));

  // Distinct Issue Styles: Closed = Green, Open = Red, In Progress = Yellow
  const getIssueStyles = (cat: IssueStatusCategory) => {
    switch (cat) {
      case 'issue_open':
        return {
          badge:
            'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          chip: 'bg-rose-600 text-white dark:bg-rose-500 font-bold',
          dot: 'bg-rose-500 dark:bg-rose-400',
          border: 'border-rose-500',
          label: 'Issue: Open',
          icon: AlertCircle,
          emoji: '🔴',
        };
      case 'issue_in_progress':
        return {
          badge:
            'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
          chip: 'bg-amber-500 text-white dark:bg-amber-500 font-bold',
          dot: 'bg-amber-500 dark:bg-amber-400',
          border: 'border-amber-500',
          label: 'Issue: In Progress',
          icon: AlertTriangle,
          emoji: '🟡',
        };
      case 'issue_closed':
        return {
          badge:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          chip: 'bg-emerald-600 text-white dark:bg-emerald-500 font-bold',
          dot: 'bg-emerald-500 dark:bg-emerald-400',
          border: 'border-emerald-500',
          label: 'Issue: Closed',
          icon: CheckCircle2,
          emoji: '🟢',
        };
    }
  };

  const createGoogleCalendarLink = (title: string, date: Date) => {
    const dateStr = format(date, 'yyyyMMdd');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${dateStr}/${dateStr}&details=TOHO+Project+Management+Schedule`;
  };

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-200 p-4 sm:px-6 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"
              />
              <path fill="#34A853" d="M19 19H5V8h14v11z" />
              <path fill="#FBBC05" d="M19 8V5H5v3h14z" />
              <path fill="#EA4335" d="M16.5 3h1v4h-1zM6.5 3h1v4h-1z" />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                Google Calendar & Project Milestones
              </h2>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Multi-Calendar ({effectiveSources.length} Aktif)
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Integrasi kalender Google, timeline durasi proyek bersambung, dan issue status
            </p>
          </div>
        </div>

        {/* Tab Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tabs: Interactive Project Milestones vs Live Embed */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs">
            <button
              onClick={() => setActiveTab('interactive')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === 'interactive'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5 text-blue-500" />
              <span>Project Milestones (Date Span)</span>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeTab === 'live'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-emerald-500" />
              <span>Live Google Calendar</span>
            </button>
          </div>

          {/* Atlassian Jira Integration Button */}
          <button
            onClick={() => setShowJiraModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
            title="Integrasi Atlassian Jira"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.53 2c0 2.4-1.97 4.35-4.4 4.35H2.8a.8.8 0 0 0-.8.8v4.33c0 2.4 1.97 4.35 4.4 4.35h4.33a.8.8 0 0 0 .8-.8V2z" opacity="0.7"/>
              <path d="M11.53 10.68c0 2.4-1.97 4.35-4.4 4.35H2.8a.8.8 0 0 0-.8.8V20.2c0 2.4 1.97 4.35 4.4 4.35h4.33a.8.8 0 0 0 .8-.8V10.68z" opacity="0.9"/>
              <path d="M21.2 2c-2.4 0-4.35 1.95-4.35 4.35v4.33c0 .44.36.8.8.8h4.33c2.4 0 4.35-1.95 4.35-4.35V2h-5.13z"/>
            </svg>
            <span>Jira Sync</span>
            {jiraIssues.length > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                {jiraIssues.length}
              </span>
            )}
          </button>

          {/* Multi-Calendar Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors shadow-2xs ${
              showSettings
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-950/40 dark:text-blue-300'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
            title="Kelola Multi Calendar ID"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Set Akun ({calendarSources.length})</span>
          </button>

          {/* Direct Link to Google Calendar */}
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <span>Buka Kalender</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </a>
        </div>
      </div>

      {/* Multi-Calendar Active Quick Badges for Live Embed */}
      {activeTab === 'live' && (
        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-2.5 bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 text-xs">
          <span className="font-semibold text-zinc-400 text-[11px] mr-1">Kalender Aktif:</span>
          {calendarSources.map((source) => (
            <button
              key={source.id}
              onClick={() => toggleCalendar(source.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all border ${
                source.enabled
                  ? 'bg-white text-zinc-900 border-zinc-300 shadow-2xs dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700'
                  : 'bg-zinc-100 text-zinc-400 border-transparent line-through opacity-60 dark:bg-zinc-900/40 dark:text-zinc-600'
              }`}
              title={source.enabled ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: source.enabled ? source.color : '#9ca3af' }}
              />
              <span className="truncate max-w-[160px]">{source.name}</span>
              {source.enabled ? (
                <Eye className="h-3 w-3 opacity-60" />
              ) : (
                <EyeOff className="h-3 w-3 opacity-60" />
              )}
            </button>
          ))}

          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline ml-auto"
          >
            <Plus className="h-3 w-3" />
            <span>Tambah ID</span>
          </button>
        </div>
      )}

      {/* Multi-Calendar Settings Drawer */}
      {showSettings && (
        <div className="border-b border-zinc-200 bg-zinc-100/80 p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950/70">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Pengaturan Multi Calendar ID (Google Calendar)</span>
                </h4>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Tambahkan beberapa Calendar ID (email Gmail, email Google Workspace perusahaan, atau kalender publik).
                  Semua kalender yang diaktifkan akan digabungkan secara otomatis dalam satu tampilan kalender.
                </p>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg bg-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Tutup
              </button>
            </div>

            {/* List of Configured Calendars */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Daftar Kalender Terkonfigurasi ({calendarSources.length})
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {calendarSources.map((source) => (
                  <div
                    key={source.id}
                    className={`flex items-center justify-between gap-2 rounded-xl border p-3 bg-white shadow-2xs dark:bg-zinc-900 transition-all ${
                      source.enabled
                        ? 'border-zinc-200 dark:border-zinc-700'
                        : 'border-zinc-200/50 bg-zinc-50/50 opacity-60 dark:border-zinc-800/50 dark:bg-zinc-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: source.color }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {source.name}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
                          {source.calendarId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleCalendar(source.id)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-colors ${
                          source.enabled
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {source.enabled ? 'Aktif' : 'Nonaktif'}
                      </button>

                      <button
                        onClick={() => handleDeleteCalendar(source.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                        title="Hapus kalender ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form: Tambah Kalender Baru */}
            <form
              onSubmit={handleAddCalendar}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs space-y-3"
            >
              <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-blue-600" />
                <span>Tambah Calendar ID Baru</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Nama Kalender
                  </label>
                  <input
                    type="text"
                    value={newCalName}
                    onChange={(e) => setNewCalName(e.target.value)}
                    placeholder="cth: Kalender Pribadi / Tim Dev"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Calendar ID / Email Google *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCalId}
                    onChange={(e) => setNewCalId(e.target.value)}
                    placeholder="cth: email@gmail.com / ID kalender"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                    Warna Kalender
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={newCalColor}
                      onChange={(e) => setNewCalColor(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                    >
                      {PRESET_COLORS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <span
                      className="h-6 w-6 rounded-lg shrink-0 border border-zinc-300 dark:border-zinc-700"
                      style={{ backgroundColor: newCalColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Berhasil Ditambahkan!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Simpan & Gabungkan</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs text-zinc-700 dark:border-amber-950/60 dark:bg-amber-950/20 dark:text-zinc-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Mengatasi Pesan: &quot;Anda tidak memiliki izin untuk melihatnya&quot;</span>
              </div>
              <div className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 space-y-1">
                <p>Secara bawaan, Google Calendar menyetel kalender pribadi ke mode <strong>Private</strong>. Agar kalender akun Anda dapat tampil di embed ini:</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-1">
                  <li>Buka <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">calendar.google.com</a> &rarr; di menu kiri bawah, klik titik tiga <strong>⋮</strong> di samping nama kalender Anda.</li>
                  <li>Pilih <strong>Settings and sharing</strong> (Setelan dan berbagi).</li>
                  <li>Pada bagian <strong>Access permissions for events</strong> (Izin akses), centang <strong>&quot;Make available to public&quot;</strong> (Sediakan untuk publik) lalu pilih <strong>&quot;See all event details&quot;</strong>.</li>
                  <li>Copy <strong>Calendar ID</strong> Anda di bagian <em>Integrate calendar</em> dan masukkan ke form di atas.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Project Milestones & Continuous Date Spans */}
      {activeTab === 'interactive' && (
        <div>
          {/* Sub-Header Month, Category Legend & Filter */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
            {/* Month & Today button */}
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
              </h3>
              <button
                onClick={goToToday}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Hari Ini
              </button>
            </div>

            {/* Category Color Legend & Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-zinc-400 font-semibold text-[11px] mr-1 hidden sm:inline flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Filter:</span>
              </span>

              {/* All */}
              <button
                onClick={() => setFilterType('all')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-colors text-[11px] ${
                  filterType === 'all'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                Semua Event ({projectSpans.length + issueEvents.length})
              </button>

              {/* Project Date Range (Blue continuous span) */}
              <button
                onClick={() => setFilterType('projects')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors text-[11px] border ${
                  filterType === 'projects'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 hover:bg-blue-100'
                }`}
              >
                <span className="h-2 w-3 rounded-sm bg-blue-500" />
                <span>Project Duration ({projectSpans.length})</span>
              </button>

              {/* Issue Open (Red / Rose) */}
              <button
                onClick={() => setFilterType('issue_open')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors text-[11px] border ${
                  filterType === 'issue_open'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 hover:bg-rose-100'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Issue: Open</span>
              </button>

              {/* Issue In Progress (Yellow / Amber) */}
              <button
                onClick={() => setFilterType('issue_in_progress')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors text-[11px] border ${
                  filterType === 'issue_in_progress'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900 hover:bg-amber-100'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Issue: In Progress</span>
              </button>

              {/* Issue Closed (Green / Emerald) */}
              <button
                onClick={() => setFilterType('issue_closed')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors text-[11px] border ${
                  filterType === 'issue_closed'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 hover:bg-emerald-100'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Issue: Closed</span>
              </button>
            </div>

            {/* Controls (View toggle & Prev/Next) */}
            <div className="flex items-center gap-2 self-end xl:self-auto">
              <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-2xs font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-500'
                  }`}
                >
                  <Grid className="h-3 w-3" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                    viewMode === 'agenda'
                      ? 'bg-white shadow-2xs font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-500'
                  }`}
                >
                  <List className="h-3 w-3" />
                  <span className="hidden sm:inline">Agenda</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body: Month Grid or Agenda List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
              {/* Main Month Grid (8 cols) */}
              <div className="lg:col-span-8 p-3 sm:p-4">
                <div className="grid grid-cols-7 text-center font-bold text-xs text-zinc-400 dark:text-zinc-500 pb-2">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span className="text-zinc-600 dark:text-zinc-400">Sab</span>
                  <span className="text-red-500 dark:text-red-400">Min</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day) => {
                    const isCurrentMonthDay = isSameMonth(day, currentMonth);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDay = isToday(day);
                    const activeProjects = getActiveProjectSpansForDay(day);
                    const dayIssues = getIssuesForDay(day);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`group relative flex min-h-[72px] sm:min-h-[88px] flex-col rounded-xl p-1 text-left transition-all border ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                            : isTodayDay
                            ? 'border-emerald-500/80 bg-emerald-50/30 dark:border-emerald-500/60 dark:bg-emerald-950/20'
                            : isCurrentMonthDay
                            ? 'border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:hover:border-zinc-700'
                            : 'border-transparent bg-zinc-50/40 text-zinc-300 dark:bg-zinc-950/20 dark:text-zinc-700'
                        }`}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-between px-1 mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isTodayDay
                                ? 'flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white font-black shadow-2xs'
                                : isSelected
                                ? 'text-blue-700 dark:text-blue-300 font-extrabold'
                                : isCurrentMonthDay
                                ? 'text-zinc-800 dark:text-zinc-200'
                                : 'text-zinc-400 dark:text-zinc-600'
                            }`}
                          >
                            {format(day, 'd')}
                          </span>

                          {/* Multi-indicator dots if multiple events */}
                          <div className="flex items-center gap-0.5">
                            {activeProjects.length > 0 && (
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            )}
                            {dayIssues.slice(0, 2).map((iss) => (
                              <span
                                key={iss.id}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  getIssueStyles(iss.statusCategory).dot
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 1. Continuous Project Duration Span Bar (Gantt-like Ribbon) */}
                        <div className="space-y-0.5 w-full overflow-hidden">
                          {activeProjects.slice(0, 2).map((proj) => {
                            const isStart = isSameDay(day, proj.startDate);
                            const isEnd = isSameDay(day, proj.endDate);
                            const isSingleDay = isStart && isEnd;

                            if (isSingleDay) {
                              return (
                                <div
                                  key={proj.id}
                                  className="truncate rounded-md bg-blue-600 px-1 py-0.5 text-[8.5px] font-bold text-white shadow-2xs"
                                  title={`Proyek: ${proj.projectCode} (${proj.projectName})`}
                                >
                                  🚀 {proj.projectCode}
                                </div>
                              );
                            }

                            if (isStart) {
                              return (
                                <div
                                  key={proj.id}
                                  className="truncate rounded-l-md rounded-r-none bg-blue-600 px-1 py-0.5 text-[8.5px] font-extrabold text-white shadow-2xs border-r border-blue-400/50"
                                  title={`Mulai: ${proj.projectCode} (${proj.projectName})`}
                                >
                                  🚀 {proj.projectCode} (Start) &rarr;
                                </div>
                              );
                            }

                            if (isEnd) {
                              return (
                                <div
                                  key={proj.id}
                                  className="truncate rounded-r-md rounded-l-none bg-indigo-700 px-1 py-0.5 text-[8.5px] font-extrabold text-white shadow-2xs border-l border-indigo-500/50"
                                  title={`Deadline: ${proj.projectCode} (${proj.projectName})`}
                                >
                                  &rarr; 🏁 {proj.projectCode} (End)
                                </div>
                              );
                            }

                            // Middle of project span
                            return (
                              <div
                                key={proj.id}
                                className="truncate rounded-none bg-blue-100/90 text-blue-900 border-y border-blue-300/80 px-1 py-0.5 text-[8px] font-semibold dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800"
                                title={`Durasi Proyek: ${proj.projectCode} (${proj.projectName})`}
                              >
                                &bull; {proj.projectCode}
                              </div>
                            );
                          })}

                          {/* 2. Issue Event Badges (Red / Yellow / Green) */}
                          {dayIssues.slice(0, 2).map((iss) => {
                            const styles = getIssueStyles(iss.statusCategory);
                            return (
                              <div
                                key={iss.id}
                                className={`truncate rounded-md px-1 py-0.5 text-[8.5px] ${styles.chip}`}
                                title={iss.title}
                              >
                                {styles.emoji} {iss.issueCode}
                              </div>
                            );
                          })}

                          {activeProjects.length + dayIssues.length > 3 && (
                            <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 block text-right pr-1">
                              +{activeProjects.length + dayIssues.length - 3} lagi
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Detail Drawer (4 cols) */}
              <div className="lg:col-span-4 p-4 sm:p-5 bg-zinc-50/40 dark:bg-zinc-950/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800 mb-4">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Agenda Terpilih
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 capitalize">
                        {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale })}
                      </h4>
                    </div>
                    <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-mono">
                      {selectedDayProjects.length + selectedDayIssues.length} Event
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {/* Active Project Spans */}
                    {selectedDayProjects.map((proj) => {
                      const isStart = isSameDay(selectedDate, proj.startDate);
                      const isEnd = isSameDay(selectedDate, proj.endDate);

                      return (
                        <div
                          key={proj.id}
                          className="rounded-xl border border-blue-300 bg-white p-3.5 shadow-2xs dark:border-blue-800 dark:bg-zinc-900/70"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                              <CalendarRange className="h-3 w-3" />
                              <span>
                                {isStart
                                  ? 'Project Kickoff'
                                  : isEnd
                                  ? 'Project Deadline'
                                  : 'Project In-Progress'}
                              </span>
                            </span>
                            <span className="font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                              {proj.projectCode}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            {proj.projectName}
                          </h5>

                          <div className="mt-2.5 rounded-lg bg-blue-50/70 p-2 text-xs text-blue-900 dark:bg-blue-950/30 dark:text-blue-200 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span>Mulai: <strong>{format(proj.startDate, 'd MMM yyyy')}</strong></span>
                              <span>&rarr;</span>
                              <span>Target: <strong>{format(proj.endDate, 'd MMM yyyy')}</strong></span>
                            </div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                              Durasi Total: {proj.totalDays} hari &bull; Customer: {proj.customerName || 'Internal'}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Issues on this date */}
                    {selectedDayIssues.map((iss) => {
                      const styles = getIssueStyles(iss.statusCategory);
                      const IconComponent = styles.icon;

                      return (
                        <div
                          key={iss.id}
                          className={`rounded-xl border bg-white p-3.5 shadow-2xs dark:bg-zinc-900/60 transition-colors ${styles.border}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${styles.badge}`}
                            >
                              <IconComponent className="h-3 w-3" />
                              <span>{styles.label}</span>
                            </span>
                            <span className="font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                              {iss.issueCode}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            {iss.title}
                          </h5>

                          {iss.description && (
                            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {iss.description}
                            </p>
                          )}

                          {iss.time && (
                            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                              <Clock className="h-3 w-3 text-zinc-400" />
                              <span>{iss.time}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {selectedDayProjects.length === 0 && selectedDayIssues.length === 0 && (
                      <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-40 text-zinc-500" />
                        <p>Tidak ada jadwal proyek atau issue pada tanggal ini.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Add Event to Google Calendar */}
                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <a
                    href={createGoogleCalendarLink('Project Milestone / Deadline / Issue', selectedDate)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah ke Google Calendar</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Agenda List View */
            <div className="p-5 space-y-4">
              {/* Projects Spans Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <CalendarRange className="h-4 w-4 text-blue-600" />
                  <span>Timeline Durasi Proyek (Start Date &rarr; End Date)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {projectSpans.map((proj) => (
                    <div
                      key={proj.id}
                      className="rounded-xl border border-blue-200 bg-white p-4 shadow-2xs dark:border-blue-900 dark:bg-zinc-900/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {proj.projectCode}
                          </span>
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                            {proj.totalDays} Hari Total
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {proj.projectName}
                        </h5>
                        {proj.customerName && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {proj.customerName}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs flex items-center justify-between text-zinc-700 dark:text-zinc-300 font-semibold">
                        <span>🚀 {format(proj.startDate, 'd MMM yyyy')}</span>
                        <span>&rarr;</span>
                        <span>🏁 {format(proj.endDate, 'd MMM yyyy')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues Section */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Daftar Issue yang Dilaporkan ({issueEvents.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {issueEvents.map((iss) => {
                    const styles = getIssueStyles(iss.statusCategory);
                    const IconComponent = styles.icon;

                    return (
                      <div
                        key={iss.id}
                        className={`rounded-xl border bg-white p-4 shadow-2xs dark:bg-zinc-900/60 flex flex-col justify-between ${styles.border}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${styles.badge}`}
                            >
                              <IconComponent className="h-3 w-3" />
                              <span>{styles.label}</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                              {format(iss.date, 'd MMM yyyy', { locale: idLocale })}
                            </span>
                          </div>

                          <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {iss.title}
                          </h5>

                          {iss.description && (
                            <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                              {iss.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{iss.time}</span>
                          </div>
                          <span className="font-mono text-[11px] rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-bold text-zinc-700 dark:text-zinc-300">
                            {iss.issueCode}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live Google Calendar Embed (Multi Calendar Source) */}
      {activeTab === 'live' && (
        <div className="w-full bg-white dark:bg-zinc-950">
          <div className="relative w-full h-[580px] sm:h-[650px] overflow-hidden">
            <iframe
              src={googleCalendarEmbedUrl}
              style={{ border: 0 }}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              title="Live Google Calendar"
              className="w-full h-full rounded-b-2xl filter dark:invert dark:hue-rotate-180 dark:contrast-85"
            />
          </div>
        </div>
      )}

      {/* Atlassian Jira Integration Modal */}
      <JiraIntegrationModal
        isOpen={showJiraModal}
        onClose={() => setShowJiraModal(false)}
        onSyncComplete={(synced) => {
          setJiraIssues(synced);
        }}
      />
    </div>
  );
}
