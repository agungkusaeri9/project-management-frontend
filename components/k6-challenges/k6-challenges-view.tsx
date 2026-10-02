'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Zap,
  Activity,
  Gauge,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  ArrowRight,
  Filter,
  RotateCcw,
  BookOpen,
  GitPullRequest,
  Server,
  Database,
  Layers,
  FileCode2,
  FileText,
  Sliders,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Cpu,
  Clock,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { K6ChallengesData, K6Challenge } from '@/data/k6-challenges';

interface K6ChallengesViewProps {
  data: K6ChallengesData;
}

export function K6ChallengesView({ data }: K6ChallengesViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'roadmap' | 'metrics' | 'report'>('catalog');
  const [expandedScripts, setExpandedScripts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleScript = (id: string) => {
    setExpandedScripts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredChallenges = useMemo(() => {
    return (data.challenges || []).filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedSeverity !== 'all') {
        const itemSev = item.severity || (item.difficulty === 'HARD' || item.difficulty === 'EXPERT' ? 'HIGH' : 'MEDIUM');
        if (itemSev !== selectedSeverity && item.difficulty !== selectedSeverity) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.objective.toLowerCase().includes(q);
        const matchScenario = item.scenario.toLowerCase().includes(q);
        const matchEndpoint = item.targetEndpoint?.toLowerCase().includes(q) ?? false;
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchQuestions = (item.questions || []).some((qu) => qu.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchScenario || matchEndpoint || matchTags || matchQuestions;
      }
      return true;
    });
  }, [data.challenges, selectedCategory, selectedSeverity, searchQuery]);

  const totalVus = useMemo(() => {
    return Math.max(...(data.challenges || []).map((c) => c.targetVus || 0), 10000);
  }, [data.challenges]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Portal
          </Link>
          <span>/</span>
          <Link href="/technology" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Challenges
          </Link>
          <span>/</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">k6 Load Testing</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {(data.challenges || []).length} Live Challenges
          </span>
          <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-mono font-medium text-zinc-600 dark:text-zinc-300">
            v{data.version}
          </span>
        </div>
      </div>

      {/* Hero Banner with Rich Aesthetics */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-gradient-to-br from-purple-900/10 via-zinc-900/5 to-indigo-900/15 dark:from-purple-950/40 dark:via-zinc-950 dark:to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-48 w-48 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 border border-purple-300/60 dark:border-purple-800/60 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-2xs">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Performance Engineering & Load Testing</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.subtitle}
            </p>

            {/* Quick Stat Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>15 Hands-on Challenges</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                <Gauge className="h-3.5 w-3.5 text-purple-500" />
                <span>Up to 10,000 VUs</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                <Server className="h-3.5 w-3.5 text-indigo-500" />
                <span>11 Scalability Levels</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                <FileCode2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Ready k6 Scripts</span>
              </div>
            </div>
          </div>

          {/* Quick Quote / Core Purpose Card */}
          <div className="lg:w-80 rounded-2xl border border-purple-200/70 bg-white/90 dark:border-purple-900/60 dark:bg-zinc-900/90 p-4 shadow-sm backdrop-blur-md space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
              <span>Core Engineering Question</span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-snug">
              &ldquo;{data.overview?.finalGoal || 'How many users can this system handle, what is the bottleneck, and what happens when we exceed its capacity?'}&rdquo;
            </p>
            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span>Goal: Empirical Optimization</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">k6 + Grafana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'catalog'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Challenges Catalog ({(data.challenges || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'roadmap'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <GitPullRequest className="h-3.5 w-3.5" />
          <span>Progression Roadmap (11 Levels)</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'metrics'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Performance Metrics & Concepts</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'report'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Report Template</span>
        </button>
      </div>

      {/* VIEW 1: CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari challenge, endpoint (/health, /register, /products), bottleneck, tag, scenario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Severity / Difficulty filter dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative min-w-[160px]">
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-2xs pr-8"
                  >
                    <option value="all">Semua Severity & Level</option>
                    <option value="CRITICAL">Critical Severity</option>
                    <option value="HIGH">High Severity</option>
                    <option value="MEDIUM">Medium Severity</option>
                    <option value="EASY">Easy Difficulty</option>
                    <option value="HARD">Hard Difficulty</option>
                    <option value="EXPERT">Expert (Final Boss)</option>
                  </select>
                  <Filter className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                </div>

                {(selectedCategory !== 'all' || selectedSeverity !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSeverity('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                    title="Reset Filter"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills List */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                Semua Level ({(data.challenges || []).length})
              </button>

              {(data.categories || []).map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                      isActive
                        ? 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white shadow-2xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="ml-1.5 text-[10px] opacity-75 font-mono">({cat.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Challenges Grid List */}
          {filteredChallenges.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Tidak ada challenge yang cocok</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                Coba sesuaikan kata kunci pencarian atau reset filter kategori/severity.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSeverity('all');
                  setSearchQuery('');
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredChallenges.map((challenge) => {
                const isScriptOpen = !!expandedScripts[challenge.id];
                const isCritical = challenge.severity === 'CRITICAL';
                const isHigh = challenge.severity === 'HIGH';

                return (
                  <div
                    key={challenge.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/90 dark:bg-zinc-900/50 hover:border-purple-300 dark:hover:border-purple-800/80 transition-all duration-200 shadow-2xs hover:shadow-md"
                  >
                    <div className="space-y-3.5">
                      {/* Top Header & Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-mono font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                            {challenge.number}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 truncate max-w-[170px]">
                            {challenge.level}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {challenge.targetVus && (
                            <span className="rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/50 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">
                              {challenge.targetVus.toLocaleString()} VUs
                            </span>
                          )}
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                              isCritical
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-900'
                                : isHigh
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                            }`}
                          >
                            {challenge.difficulty || challenge.severity}
                          </span>
                        </div>
                      </div>

                      {/* Title & Target Endpoint */}
                      <div>
                        <Link
                          href={`/technology/k6-challenges/${challenge.id}`}
                          className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2"
                        >
                          {challenge.title}
                        </Link>

                        {challenge.targetEndpoint && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
                              {challenge.targetMethod || 'TEST'}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate">
                              {challenge.targetEndpoint}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Objective snippet */}
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                        {challenge.objective}
                      </p>

                      {/* Success Criteria List */}
                      {challenge.successCriteria && challenge.successCriteria.length > 0 && (
                        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/40 p-2.5 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            Success Criteria
                          </div>
                          {challenge.successCriteria.slice(0, 2).map((crit, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{crit}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Inline k6 Script Accordion */}
                      {challenge.k6Script && (
                        <div className="pt-1">
                          <button
                            onClick={() => toggleScript(challenge.id)}
                            className="flex items-center justify-between w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <FileCode2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                              <span>k6 Test Script</span>
                            </span>
                            {isScriptOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>

                          {isScriptOpen && (
                            <div className="mt-2 relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-3 text-zinc-200 text-[11px] font-mono overflow-x-auto">
                              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800 text-[10px] text-zinc-400">
                                <span>test-script.js</span>
                                <button
                                  onClick={() => handleCopy(challenge.k6Script || '', challenge.id)}
                                  className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-zinc-200 hover:bg-zinc-700 transition-colors"
                                >
                                  {copiedId === challenge.id ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="max-h-48 overflow-y-auto leading-relaxed text-purple-300">
                                {challenge.k6Script}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {challenge.tags && challenge.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {challenge.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Action Link */}
                    <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">
                        {challenge.duration || 'Load test'}
                      </span>

                      <Link
                        href={`/technology/k6-challenges/${challenge.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors"
                      >
                        <span>Buka Detail & Lab</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PROGRESSION ROADMAP TAB */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
              <GitPullRequest className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Recommended Learning Progression</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Jalur bertahap untuk mempelajari performance engineering mulai dari pengujian baseline API hingga membangun arsitektur production terdistribusi yang mampu menahan 10.000 concurrent users.
            </p>

            {/* Progression Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-8 pt-4 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-indigo-500 before:to-rose-500">
              {(data.categories || []).map((cat, catIdx) => {
                const catChallenges = (data.challenges || []).filter((c) => c.category === cat.id);
                const isFinal = cat.id === 'production';

                return (
                  <div key={cat.id} className="relative group">
                    {/* Step Icon / Dot */}
                    <div className={`absolute -left-6 sm:-left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono font-bold shadow-md ring-4 ring-white dark:ring-zinc-950 ${
                      isFinal
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}>
                      {catIdx + 1}
                    </div>

                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/80 p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className={`text-sm sm:text-base font-bold ${
                          isFinal ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {cat.label}
                        </h3>
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                          {catChallenges.length} Challenge(s)
                        </span>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {catChallenges.map((c) => (
                          <Link
                            key={c.id}
                            href={`/technology/k6-challenges/${c.id}`}
                            className="group/item flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/60 hover:border-purple-400 dark:hover:border-purple-600 transition-colors shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                {c.number}
                              </span>
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 truncate">
                                {c.title}
                              </span>
                            </div>
                            <span className="rounded bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 text-[10px] font-mono text-purple-700 dark:text-purple-300 shrink-0 ml-2">
                              {c.targetVus?.toLocaleString()} VUs
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PERFORMANCE METRICS & CONCEPTS TAB */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          {/* Key Metrics Reference Table */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Standard Performance Metrics</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Setiap load testing challenge wajib mengukur parameter-parameter metrik berikut untuk menghasilkan analisis empiris yang akurat:
            </p>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Metric</th>
                    <th className="px-4 py-3">Description & Engineering Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                  {(data.performanceMetrics || []).map((m, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                        {m.metric}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {m.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Important Concepts Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Fundamental Performance Engineering Concepts</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {(data.importantConcepts || []).map((concept, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 space-y-2.5 shadow-2xs"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                      {idx + 1}
                    </span>
                    <span>{concept.concept}</span>
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {concept.summary}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2 leading-normal">
                    💡 {concept.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Reference Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Recommended Tooling & Stack
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.techStack?.recommended || []).map((tool) => (
                <span
                  key={tool}
                  className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 shadow-2xs"
                >
                  {tool}
                </span>
              ))}
            </div>
            {data.techStack?.note && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic pt-1">
                {data.techStack.note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: REPORT TEMPLATE TAB */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Standard Performance Report Template</span>
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Gunakan format markdown di bawah ini untuk mencatat hasil test, hipotesis, bottleneck, dan analisis sebelum vs sesudah optimasi.
                </p>
              </div>

              <button
                onClick={() => {
                  const templateMd = `# Challenge XX — [Challenge Title]

## Objective
What are we trying to learn?

## Hypothesis
What do we expect to happen under load?

## Test Configuration
- Virtual Users: 
- Duration: 
- Ramp Up: 
- Target Endpoint: 
- Environment: 

## Results
| Metric | Result |
| ------ | -----: |
| RPS | |
| p50 | |
| p95 | |
| p99 | |
| Error Rate | |
| CPU | |
| Memory | |

## Bottleneck
What became the bottleneck?

## Root Cause
Why did it happen?

## Solution
What did we change?

## Before vs After
| Metric | Before | After |
| ------ | -----: | ----: |
| p95 | | |
| RPS | | |
| Error Rate | | |

## Conclusion
What did we learn?

## Trade-offs
What are the disadvantages or overheads of the solution?`;
                  handleCopy(templateMd, 'report-template');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-purple-700 transition-colors shrink-0"
              >
                {copiedId === 'report-template' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Template Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Markdown Template</span>
                  </>
                )}
              </button>
            </div>

            {/* Template Markdown Preview */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-purple-300 overflow-x-auto leading-relaxed">
              <pre>{`# Challenge XX — [Name]

## Objective
What are we trying to learn?

## Hypothesis
What do we expect to happen?

## Test Configuration
- Virtual Users:
- Duration:
- Ramp Up:
- Target:
- Environment:

## Results
| Metric     | Result |
| ---------- | -----: |
| RPS        |        |
| p50        |        |
| p95        |        |
| p99        |        |
| Error Rate |        |
| CPU        |        |
| Memory     |        |

## Bottleneck
What became the bottleneck?

## Root Cause
Why did it happen?

## Solution
What did we change?

## Before vs After
| Metric     | Before | After |
| ---------- | -----: | ----: |
| p95        |        |       |
| RPS        |        |       |
| Error Rate |        |       |

## Conclusion
What did we learn?

## Trade-offs
What are the disadvantages of the solution?`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
