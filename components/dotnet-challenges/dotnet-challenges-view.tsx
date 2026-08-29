'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Code2,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  ArrowLeft,
  ArrowRight,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Lightbulb,
  Cpu,
  Database,
  Radio,
  Printer,
  ChevronDown,
  ChevronUp,
  Tag,
  Landmark,
  ShoppingCart,
  Network,
  Webhook,
  Boxes,
  ListChecks,
  FileCode2,
  ExternalLink,
} from 'lucide-react';
import { DotnetChallengesData, DotnetChallenge } from '@/data/dotnet-challenges';

interface DotnetChallengesViewProps {
  data: DotnetChallengesData;
}

export function DotnetChallengesView({ data }: DotnetChallengesViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  // By default, all challenges toggles are closed
  const [expandedChallenges, setExpandedChallenges] = useState<Record<string, boolean>>({});
  const [codeViewModes, setCodeViewModes] = useState<Record<string, 'split' | 'bad' | 'good'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toggle challenge accordion
  const toggleChallenge = (id: string) => {
    setExpandedChallenges((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Expand all / Collapse all
  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    (data.challenges || []).forEach((c) => {
      next[c.id] = true;
    });
    setExpandedChallenges(next);
  };

  const handleCollapseAll = () => {
    setExpandedChallenges({});
  };

  // Copy code handler
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter challenges safely
  const filteredChallenges = useMemo(() => {
    return (data.challenges || []).filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Severity / Difficulty filter
      if (selectedSeverity !== 'all') {
        const itemSev =
          item.severity ||
          (item.difficulty === 'HARD'
            ? 'HIGH'
            : item.difficulty === 'MEDIUM'
            ? 'MEDIUM'
            : 'LOW');
        if (itemSev !== selectedSeverity && item.difficulty !== selectedSeverity) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = item.title?.toLowerCase().includes(query) ?? false;
        const inDesc = item.description?.toLowerCase().includes(query) ?? false;
        const inScenario = item.scenario?.toLowerCase().includes(query) ?? false;
        const inImpact = item.impact?.toLowerCase().includes(query) ?? false;
        const inRootCause = item.rootCause?.toLowerCase().includes(query) ?? false;
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(query));
        const inReqs = (item.requirements || []).some((r) => r.toLowerCase().includes(query));
        const inTech = (item.technologies || []).some((tech) => tech.toLowerCase().includes(query));
        const inConcepts = (item.concepts || []).some((c) => c.toLowerCase().includes(query));
        const inCode =
          (item.badCode?.toLowerCase().includes(query) ?? false) ||
          (item.goodCode?.toLowerCase().includes(query) ?? false);

        return (
          inTitle ||
          inDesc ||
          inScenario ||
          inImpact ||
          inRootCause ||
          inTags ||
          inReqs ||
          inTech ||
          inConcepts ||
          inCode
        );
      }
      return true;
    });
  }, [data.challenges, selectedCategory, selectedSeverity, searchQuery]);

  // Summary Metrics
  const stats = useMemo(() => {
    const list = data.challenges || [];
    const total = list.length;
    const critical = list.filter((c) => c.severity === 'CRITICAL').length;
    const hard = list.filter((c) => c.difficulty === 'HARD' || c.severity === 'HIGH').length;
    const categoriesCount = (data.categories || []).length;
    return { total, critical, hard, categoriesCount };
  }, [data.challenges, data.categories]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return Landmark;
      case 'ecommerce':
        return ShoppingCart;
      case 'high-traffic':
        return Zap;
      case 'distributed':
        return Network;
      case 'messaging':
        return Radio;
      case 'resiliency':
        return ShieldCheck;
      case 'security':
        return ShieldAlert;
      case 'data':
        return Database;
      case 'integration':
        return Webhook;
      case 'architecture':
        return Boxes;
      case 'concurrency':
        return Zap;
      case 'efcore':
        return Database;
      case 'memory':
        return Cpu;
      default:
        return Code2;
    }
  };

  const getSeverityBadge = (severity?: string, difficulty?: string) => {
    const sev =
      severity ||
      (difficulty === 'HARD' ? 'HIGH' : difficulty === 'MEDIUM' ? 'MEDIUM' : undefined);

    if (sev === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          CRITICAL
        </span>
      );
    }
    if (sev === 'HIGH' || difficulty === 'HARD') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-300">
          <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          {difficulty === 'HARD' ? 'HARD' : 'HIGH'}
        </span>
      );
    }
    if (sev === 'MEDIUM' || difficulty === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:text-blue-300">
          <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          MEDIUM
        </span>
      );
    }
    if (difficulty === 'EASY') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          EASY
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Overview
          </Link>
          <span>/</span>
          <Link href="/technology" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Technology Stack
          </Link>
          <span>/</span>
          <Link href="/technology/dotnet" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            .NET Standard
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">
            Real-World Challenges
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Guide</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-100/70 p-6 sm:p-8 dark:border-zinc-800 dark:from-zinc-900/90 dark:via-zinc-900/50 dark:to-zinc-950 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                <Flame className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                Enterprise .NET Hardcore Scenarios
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                v{data.version}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.title}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {data.subtitle}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/40 backdrop-blur-xs shadow-2xs">
              <span className="block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {stats.total}
              </span>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Tantangan
              </span>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/40 backdrop-blur-xs shadow-2xs">
              <span className="block text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {stats.critical}
              </span>
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                Critical
              </span>
            </div>

            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-center dark:border-amber-900/50 dark:bg-amber-950/30 backdrop-blur-xs shadow-2xs">
              <span className="block text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.hard}
              </span>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                Hard Priority
              </span>
            </div>

            <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3 text-center dark:border-blue-900/50 dark:bg-blue-950/30 backdrop-blur-xs shadow-2xs">
              <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">
                {stats.categoriesCount}
              </span>
              <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                Kategori Domain
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tantangan (misal: payment, idempotency, lock, redis, LOH, outbox, sql, jwt)..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={handleExpandAll}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-2xs transition-colors"
            >
              Buka Semua
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 shadow-2xs transition-colors"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Semua ({stats.total})
          </button>
          {(data.categories || []).map((cat) => {
            const Icon = getCategoryIcon(cat.id);
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      active
                        ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-900'
                        : 'bg-zinc-200/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Severity / Difficulty Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">Severity/Level:</span>
            {['all', 'CRITICAL', 'HARD', 'MEDIUM'].map((sev) => {
              const active = selectedSeverity === sev;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSelectedSeverity(sev)}
                  className={`rounded-md px-2 py-0.5 font-bold transition-colors ${
                    active
                      ? sev === 'CRITICAL'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : sev === 'HARD'
                        ? 'bg-amber-600 text-white'
                        : sev === 'MEDIUM'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  {sev === 'all' ? 'Semua' : sev}
                </button>
              );
            })}
          </div>

          <div className="text-zinc-500 dark:text-zinc-400 font-medium">
            Menampilkan <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredChallenges.length}</span> dari {stats.total} tantangan
          </div>
        </div>
      </div>

      {/* Challenges List (Accordion) */}
      <div className="space-y-4">
        {filteredChallenges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <AlertOctagon className="mx-auto h-8 w-8 text-zinc-400" />
            <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Tidak ada tantangan yang cocok
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau reset filter kategori & tingkat severity.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSeverity('all');
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        ) : (
          filteredChallenges.map((challenge, index) => {
            const isExpanded = expandedChallenges[challenge.id] ?? false;
            const CategoryIcon = getCategoryIcon(challenge.category);
            const viewMode = codeViewModes[challenge.id] ?? 'split';

            const summaryText =
              challenge.description ||
              challenge.impact ||
              challenge.scenario ||
              'Real-world engineering challenge specification.';

            return (
              <div
                key={challenge.id}
                id={challenge.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs"
              >
                {/* Challenge Header / Accordion Trigger */}
                <div
                  onClick={() => toggleChallenge(challenge.id)}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:px-6 cursor-pointer select-none hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors border-b border-zinc-100 dark:border-zinc-800/60"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 mt-0.5 shadow-2xs">
                      <CategoryIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        {getSeverityBadge(challenge.severity, challenge.difficulty)}
                        <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                          {challenge.categoryLabel || challenge.category}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        {challenge.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <Link
                      href={`/technology/dotnet-challenges/${challenge.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-indigo-400 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                      title="Buka Halaman Detail Khusus"
                    >
                      <span>Detail</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 shadow-2xs"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Challenge Summary Always Visible */}
                <div className="px-5 sm:px-6 py-3 bg-zinc-50/60 dark:bg-zinc-950/30 border-b border-zinc-100 dark:border-zinc-800/40 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
                      ⚡ Deskripsi / Problem:
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                      {summaryText}
                    </span>
                  </div>
                </div>

                {/* Expandable Deep Dive Body */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Scenario Callout (if present) */}
                    {challenge.scenario && (
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          Skenario Kasus Nyata (Real-World Scenario)
                        </span>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {challenge.scenario}
                        </p>
                      </div>
                    )}

                    {/* Requirements & Success Criteria Grid */}
                    {(challenge.requirements || challenge.successCriteria) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Requirements */}
                        {challenge.requirements && challenge.requirements.length > 0 && (
                          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2.5">
                              <ListChecks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              Kebutuhan Sistem (System Requirements)
                            </span>
                            <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                              {challenge.requirements.map((req, rIdx) => (
                                <li key={rIdx} className="flex items-start gap-2">
                                  <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                                    ✓
                                  </span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Success Criteria */}
                        {challenge.successCriteria && challenge.successCriteria.length > 0 && (
                          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              Kriteria Keberhasilan (Success Criteria)
                            </span>
                            <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                              {challenge.successCriteria.map((crit, cIdx) => (
                                <li key={cIdx} className="flex items-start gap-2">
                                  <span className="text-emerald-500 font-bold shrink-0">★</span>
                                  <span>{crit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Symptoms & Root Cause Box (if present) */}
                    {(challenge.symptoms?.length || challenge.rootCause) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Symptoms */}
                        {challenge.symptoms && challenge.symptoms.length > 0 && (
                          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                              <AlertOctagon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                              Gejala / Observabilitas (Symptoms)
                            </span>
                            <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                              {challenge.symptoms.map((sym, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-zinc-500 font-bold shrink-0">•</span>
                                  <span>{sym}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Root Cause */}
                        {challenge.rootCause && (
                          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                              <AlertTriangle className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                              Akar Masalah (Root Cause)
                            </span>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {challenge.rootCause}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Code Comparison Section (if code is provided) */}
                    {(challenge.badCode || challenge.goodCode) && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              Perbandingan Implementasi Kode (C#)
                            </span>
                          </div>

                          {/* View Switcher: Split vs Bad vs Good */}
                          <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                setCodeViewModes((prev) => ({ ...prev, [challenge.id]: 'split' }))
                              }
                              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                                viewMode === 'split'
                                  ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs'
                                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                              }`}
                            >
                              Split View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCodeViewModes((prev) => ({ ...prev, [challenge.id]: 'bad' }))
                              }
                              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                                viewMode === 'bad'
                                  ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs'
                                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                              }`}
                            >
                              Bad Code
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCodeViewModes((prev) => ({ ...prev, [challenge.id]: 'good' }))
                              }
                              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                                viewMode === 'good'
                                  ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs'
                                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                              }`}
                            >
                              Good Code
                            </button>
                          </div>
                        </div>

                        {/* Code Display Blocks */}
                        <div
                          className={`grid gap-4 ${
                            viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
                          }`}
                        >
                          {/* Bad Code */}
                          {(viewMode === 'split' || viewMode === 'bad') && challenge.badCode && (
                            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-50 shadow-xs">
                              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs">
                                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-zinc-400" />
                                  ❌ Anti-Pattern (Penyebab Masalah)
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(challenge.badCode || '', `${challenge.id}-bad`)
                                  }
                                  className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
                                >
                                  {copiedId === `${challenge.id}-bad` ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span>Tersalin!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-zinc-300 whitespace-pre">
                                <code>{challenge.badCode}</code>
                              </pre>
                            </div>
                          )}

                          {/* Good Code */}
                          {(viewMode === 'split' || viewMode === 'good') && challenge.goodCode && (
                            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-50 shadow-xs">
                              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs">
                                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                  ✅ Best Practice Solution
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(challenge.goodCode || '', `${challenge.id}-good`)
                                  }
                                  className="flex items-center gap-1 rounded bg-zinc-900/80 px-2 py-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                                >
                                  {copiedId === `${challenge.id}-good` ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span>Tersalin!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-emerald-200/90 whitespace-pre">
                                <code>{challenge.goodCode}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Architecture Flow / Concepts / Technologies */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Flow / Architecture */}
                      {(challenge.flow || challenge.architectureFlow) && (
                        <div className="lg:col-span-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50 flex flex-col justify-between">
                          <div>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                              <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                              Alur Aliran Arsitektur (Flow)
                            </span>
                            <div className="rounded-lg border border-zinc-300/80 bg-white p-2.5 font-mono text-[11px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                              {challenge.flow || challenge.architectureFlow}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Technologies & Concepts */}
                      <div className={`${(challenge.flow || challenge.architectureFlow) ? 'lg:col-span-2' : 'lg:col-span-3'} rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30 space-y-3`}>
                        {challenge.technologies && challenge.technologies.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                              Teknologi / Stack:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {challenge.technologies.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800/80 dark:text-indigo-300"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {challenge.concepts && challenge.concepts.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                              Konsep Arsitektur Utama:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {challenge.concepts.map((c) => (
                                <span
                                  key={c}
                                  className="rounded-md bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {challenge.tags && challenge.tags.length > 0 && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[11px] font-bold text-zinc-400 mr-1">Tags:</span>
                            {challenge.tags.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setSearchQuery(t)}
                                className="inline-flex items-center gap-1 rounded-md bg-zinc-200/60 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                              >
                                <Tag className="h-2.5 w-2.5 text-zinc-400" />
                                <span>{t}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step-by-Step Resolution (if provided) */}
                    {challenge.solutionSteps && challenge.solutionSteps.length > 0 && (
                      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Langkah Penyelesaian Teknis (Actionable Steps)
                        </span>
                        <div className="space-y-2">
                          {challenge.solutionSteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2.5 text-xs">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                {sIdx + 1}
                              </span>
                              <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Takeaway / Explanation Callout */}
                    {(challenge.keyTakeaway || challenge.explanation) && (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30 flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500 shadow-2xs">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wide">
                            Golden Rule / Key Takeaway:
                          </span>
                          <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 leading-relaxed">
                            {challenge.keyTakeaway || challenge.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer Navigation */}
      <div className="mt-12 border-t border-zinc-200 pt-6 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/technology/dotnet"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke .NET Technology Standard</span>
          </Link>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Standardized Software Engineering &bull; .NET Real-World Enterprise Hardcore Architecture
        </p>
      </div>
    </div>
  );
}
