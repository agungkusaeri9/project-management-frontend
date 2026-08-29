'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Terminal,
  Printer,
  Share2,
  Lightbulb,
  Zap,
  Cpu,
  Database,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Tag,
  ListFilter,
  Landmark,
  ShoppingCart,
  Network,
  Webhook,
  Boxes,
  ListChecks,
  Server,
  Lock,
  Layers,
} from 'lucide-react';
import { NestChallenge, ChallengeSeverity } from '@/data/nest-challenges';

interface NestChallengeDetailViewProps {
  challenge: NestChallenge;
  allChallenges: NestChallenge[];
}

export function NestChallengeDetailView({
  challenge,
  allChallenges,
}: NestChallengeDetailViewProps) {
  const [viewMode, setViewMode] = useState<'split' | 'bad' | 'good'>('split');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Find index for Prev / Next navigation
  const currentIndex = (allChallenges || []).findIndex((c) => c.id === challenge.id);
  const prevChallenge = currentIndex > 0 ? allChallenges[currentIndex - 1] : null;
  const nextChallenge =
    currentIndex >= 0 && currentIndex < allChallenges.length - 1
      ? allChallenges[currentIndex + 1]
      : null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

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
        return Lock;
      case 'data':
        return Database;
      case 'integration':
        return Webhook;
      case 'architecture':
        return Boxes;
      default:
        return Server;
    }
  };

  const getSeverityBadge = (severity?: string, difficulty?: string) => {
    const sev =
      severity ||
      (difficulty === 'HARD' || difficulty === 'EXPERT'
        ? 'HIGH'
        : difficulty === 'MEDIUM'
        ? 'MEDIUM'
        : undefined);

    if (sev === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          CRITICAL
        </span>
      );
    }
    if (difficulty === 'EXPERT') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2.5 py-0.5 text-xs font-bold shadow-2xs">
          EXPERT
        </span>
      );
    }
    if (sev === 'HIGH' || difficulty === 'HARD') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300">
          <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          {difficulty === 'HARD' ? 'HARD' : 'HIGH'}
        </span>
      );
    }
    if (sev === 'MEDIUM' || difficulty === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:text-blue-300">
          <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          MEDIUM
        </span>
      );
    }
    if (difficulty === 'EASY') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          EASY
        </span>
      );
    }
    return null;
  };

  const CategoryIcon = getCategoryIcon(challenge.category);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Overview
          </Link>
          <span>/</span>
          <Link
            href="/technology"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Technology Stack
          </Link>
          <span>/</span>
          <Link
            href="/technology/nestjs-challenges"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            NestJS Challenges
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold truncate max-w-xs sm:max-w-md">
            {challenge.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            {copiedUrl ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Link Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Bagikan</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Main Challenge Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-100/60 p-6 sm:p-8 dark:border-zinc-800 dark:from-zinc-900/80 dark:via-zinc-900/40 dark:to-zinc-950 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                Tantangan #{String(currentIndex + 1).padStart(2, '0')} dari{' '}
                {(allChallenges || []).length}
              </span>
              {getSeverityBadge(challenge.severity, challenge.difficulty)}
              <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {challenge.categoryLabel || challenge.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {challenge.title}
            </h1>

            {/* Impact / Description Banner */}
            {(challenge.description || challenge.impact) && (
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs shrink-0 uppercase tracking-wide">
                    ⚡ Deskripsi / Problem:
                  </span>
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {challenge.description || challenge.impact}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/technology/nestjs-challenges"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Semua Tantangan NestJS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scenario Callout (if present) */}
      {challenge.scenario && (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs space-y-2">
          <span className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Skenario Kasus Nyata (Real-World Scenario)
          </span>
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {challenge.scenario}
          </p>
        </div>
      )}

      {/* Requirements & Success Criteria Grid */}
      {(challenge.requirements || challenge.successCriteria) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Requirements */}
          {challenge.requirements && challenge.requirements.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/30 shadow-2xs space-y-3">
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                <ListChecks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Kebutuhan Rekayasa Sistem (Requirements)
              </span>
              <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                {challenge.requirements.map((req, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Criteria */}
          {challenge.successCriteria && challenge.successCriteria.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/30 shadow-2xs space-y-3">
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Kriteria Keberhasilan (Success Criteria)
              </span>
              <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                {challenge.successCriteria.map((crit, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-2.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      ★
                    </span>
                    <span className="leading-relaxed">{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Example Modules / Services / Permissions (if present) */}
      {(challenge.exampleModules || challenge.exampleServices || challenge.examplePermissions) && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/30 shadow-2xs space-y-4">
          {challenge.exampleModules && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Contoh Modul Arsitektur:
              </span>
              <div className="flex flex-wrap gap-2">
                {challenge.exampleModules.map((mod) => (
                  <span
                    key={mod}
                    className="rounded-lg bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-xs font-mono font-semibold text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          )}

          {challenge.exampleServices && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Contoh Services:
              </span>
              <div className="flex flex-wrap gap-2">
                {challenge.exampleServices.map((svc) => (
                  <span
                    key={svc}
                    className="rounded-lg bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-xs font-mono font-semibold text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {challenge.examplePermissions && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Contoh Izin Hak Akses (Permissions):
              </span>
              <div className="flex flex-wrap gap-2">
                {challenge.examplePermissions.map((perm) => (
                  <span
                    key={perm}
                    className="rounded-lg bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-xs font-mono font-semibold text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Symptoms & Root Cause Deep Dive (if present) */}
      {(challenge.symptoms?.length || challenge.rootCause) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Symptoms */}
          {challenge.symptoms && challenge.symptoms.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/30 shadow-2xs space-y-3">
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                <AlertOctagon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                Gejala & Indikasi Masalah (Observable Symptoms)
              </span>
              <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                {challenge.symptoms.map((sym, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{sym}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Root Cause */}
          {challenge.rootCause && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 sm:p-6 dark:border-amber-950/60 dark:bg-amber-950/20 shadow-2xs space-y-3">
              <span className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Analisis Akar Masalah (Root Cause Analysis)
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {challenge.rootCause}
              </p>
              {challenge.explanation && (
                <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed italic">
                  &ldquo;{challenge.explanation}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Code Comparison Section (if code is present) */}
      {(challenge.badCode || challenge.goodCode) && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Perbandingan Implementasi Kode (NestJS / TypeScript)
              </h2>
            </div>

            {/* View Toggle */}
            <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                  viewMode === 'split'
                    ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('bad')}
                className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                  viewMode === 'bad'
                    ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Bad Code
              </button>
              <button
                type="button"
                onClick={() => setViewMode('good')}
                className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                  viewMode === 'good'
                    ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Good Code
              </button>
            </div>
          </div>

          {/* Code Displays */}
          <div
            className={`grid gap-4 ${
              viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* Bad Code */}
            {(viewMode === 'split' || viewMode === 'bad') && challenge.badCode && (
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-50 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-xs">
                  <span className="font-bold text-zinc-300 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-400" />
                    ❌ Anti-Pattern (Penyebab Masalah)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(challenge.badCode || '', 'bad-code')}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                  >
                    {copiedId === 'bad-code' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-x-auto text-zinc-300 whitespace-pre">
                  <code>{challenge.badCode}</code>
                </pre>
              </div>
            )}

            {/* Good Code */}
            {(viewMode === 'split' || viewMode === 'good') && challenge.goodCode && (
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-50 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-xs">
                  <span className="font-bold text-zinc-300 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    ✅ Best Practice Solution
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(challenge.goodCode || '', 'good-code')}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-900/90 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                  >
                    {copiedId === 'good-code' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-x-auto text-emerald-200/90 whitespace-pre">
                  <code>{challenge.goodCode}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Architecture Flow & Technologies / Concepts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Architecture Flow / Flow Diagram */}
        {(challenge.flow || challenge.architectureFlow || challenge.architecture || challenge.targetArchitecture) && (
          <div className="lg:col-span-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50 flex flex-col justify-between shadow-2xs space-y-4">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-2.5">
                <Terminal className="h-4 w-4 text-indigo-600" />
                Alur Aliran Arsitektur (Flow / Topology)
              </span>
              <div className="rounded-xl border border-zinc-300/80 bg-white p-3.5 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                {challenge.flow || challenge.architectureFlow || challenge.architecture || challenge.targetArchitecture}
              </div>
            </div>
          </div>
        )}

        {/* Technologies & Concepts */}
        <div
          className={`${
            challenge.flow || challenge.architectureFlow || challenge.architecture || challenge.targetArchitecture
              ? 'lg:col-span-2'
              : 'lg:col-span-3'
          } rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/30 shadow-2xs space-y-4`}
        >
          {challenge.technologies && challenge.technologies.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Teknologi / Frameworks:
              </span>
              <div className="flex flex-wrap gap-2">
                {challenge.technologies.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800/80 dark:text-indigo-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {challenge.concepts && challenge.concepts.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Konsep Arsitektur Utama:
              </span>
              <div className="flex flex-wrap gap-2">
                {challenge.concepts.map((c) => (
                  <span
                    key={c}
                    className="rounded-lg bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {challenge.tags && challenge.tags.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-bold text-zinc-400 mr-1">Tags:</span>
              {challenge.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-md bg-zinc-200/70 px-2 py-0.5 text-xs font-mono font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <Tag className="h-3 w-3 text-zinc-400" />
                  <span>{t}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Step-by-Step Resolution (if provided) */}
      {challenge.solutionSteps && challenge.solutionSteps.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/30 shadow-2xs space-y-3">
          <span className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Langkah Penyelesaian Teknis (Actionable Steps)
          </span>
          <div className="space-y-2.5 pt-1">
            {challenge.solutionSteps.map((step, sIdx) => (
              <div
                key={sIdx}
                className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40 text-xs"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {sIdx + 1}
                </span>
                <span className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Takeaway Callout (if provided) */}
      {(challenge.keyTakeaway || challenge.explanation) && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 sm:p-6 dark:border-indigo-900/60 dark:bg-indigo-950/40 flex items-start gap-4 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white dark:bg-indigo-500 shadow-2xs">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wide">
              Golden Rule / Key Takeaway:
            </span>
            <p className="text-xs sm:text-sm font-semibold text-indigo-900 dark:text-indigo-300 leading-relaxed">
              {challenge.keyTakeaway || challenge.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Prev / Next Challenge Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {prevChallenge ? (
          <Link
            href={`/technology/nestjs-challenges/${prevChallenge.id}`}
            className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50 transition-all shadow-2xs"
          >
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              Tantangan Sebelumnya
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
              {prevChallenge.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextChallenge && (
          <Link
            href={`/technology/nestjs-challenges/${nextChallenge.id}`}
            className="group flex flex-col items-end text-right rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50 transition-all shadow-2xs sm:col-start-2"
          >
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mb-1">
              Tantangan Berikutnya
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
              {nextChallenge.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
