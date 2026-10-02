'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Code2,
  Terminal,
  FileCode2,
  GitBranch,
  Server,
  Database,
  BarChart3,
  HelpCircle,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileText,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { K6Challenge } from '@/data/k6-challenges';

interface K6ChallengeDetailViewProps {
  challenge: K6Challenge;
  allChallenges: K6Challenge[];
}

export function K6ChallengeDetailView({
  challenge,
  allChallenges,
}: K6ChallengeDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'script' | 'architecture' | 'questions' | 'benchmark'>('overview');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});

  const currentIndex = allChallenges.findIndex(
    (c) => c.id.toLowerCase() === challenge.id.toLowerCase()
  );
  const prevChallenge = currentIndex > 0 ? allChallenges[currentIndex - 1] : null;
  const nextChallenge =
    currentIndex >= 0 && currentIndex < allChallenges.length - 1
      ? allChallenges[currentIndex + 1]
      : null;

  const handleCopyScript = () => {
    if (challenge.k6Script) {
      navigator.clipboard.writeText(challenge.k6Script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const toggleAnswer = (idx: number) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyReport = () => {
    const reportMd = `# Performance Report: Challenge ${challenge.number} — ${challenge.title}

## Objective
${challenge.objective}

## Scenario
${challenge.scenario}

## Test Configuration
- Target Endpoint: ${challenge.targetEndpoint || 'N/A'} (${challenge.targetMethod || 'GET'})
- Virtual Users: ${challenge.targetVus ? challenge.targetVus.toLocaleString() : 'N/A'} VUs
- Duration: ${challenge.duration || 'N/A'}
- Load Profile: ${challenge.loadProfile || 'N/A'}

## Success Criteria
${(challenge.successCriteria || []).map((c) => `- ${c}`).join('\n')}

## Results
| Metric | Result | Target / SLA |
| ------ | -----: | -----------: |
| RPS | ${challenge.benchmarkData?.after[3] || 'TBD'} | Max sustainable |
| p50 | ${challenge.benchmarkData?.after[0] || 'TBD'} | < 50ms |
| p95 | ${challenge.benchmarkData?.after[1] || 'TBD'} | < 500ms |
| p99 | ${challenge.benchmarkData?.after[2] || 'TBD'} | < 1000ms |
| Error Rate | < 0.5% | < 1.0% |

## Bottleneck Identified
${challenge.bottleneck || 'Analyze using Grafana/Prometheus dashboard during load execution.'}

## Root Cause
${challenge.rootCause || 'Investigate resource saturation (CPU/DB Connections/Locks).'}

## Solution Applied
${challenge.solution || 'Optimization applied according to engineering guideline.'}

## Conclusion & Learnings
Empirical test validating system scalability boundaries.`;

    navigator.clipboard.writeText(reportMd);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const isCritical = challenge.severity === 'CRITICAL';
  const isHigh = challenge.severity === 'HIGH';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Navigation / Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <Link
          href="/technology/k6-challenges"
          className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Semua Tantangan k6</span>
        </Link>

        <div className="flex items-center gap-2">
          {prevChallenge && (
            <Link
              href={`/technology/k6-challenges/${prevChallenge.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Ch. {prevChallenge.number}</span>
            </Link>
          )}

          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            {challenge.number} / {String(allChallenges.length).padStart(2, '0')}
          </span>

          {nextChallenge && (
            <Link
              href={`/technology/k6-challenges/${nextChallenge.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>Ch. {nextChallenge.number}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-gradient-to-br from-purple-900/10 via-zinc-900/5 to-indigo-900/15 dark:from-purple-950/40 dark:via-zinc-950 dark:to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-sm font-mono font-extrabold text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs">
            {challenge.number}
          </span>
          <span className="rounded-xl bg-purple-100 dark:bg-purple-950/70 border border-purple-300/60 dark:border-purple-800/60 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
            {challenge.level}
          </span>
          <span
            className={`rounded-xl px-2.5 py-1 text-xs font-bold tracking-wide ${
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

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {challenge.title}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-4xl">
          {challenge.objective}
        </p>

        {/* Quick Parameter Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
          {challenge.targetEndpoint && (
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-mono text-zinc-800 dark:text-zinc-200 shadow-2xs">
              <span className="font-bold text-purple-600 dark:text-purple-400">{challenge.targetMethod || 'TEST'}</span>
              <span>{challenge.targetEndpoint}</span>
            </div>
          )}
          {challenge.targetVus && (
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-purple-500" />
              <span>Target: <strong>{challenge.targetVus.toLocaleString()} VUs</strong></span>
            </div>
          )}
          {challenge.duration && (
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>Duration: <strong>{challenge.duration}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Overview & Scenario</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'script'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <FileCode2 className="h-3.5 w-3.5" />
          <span>k6 Test Script</span>
        </button>

        {(challenge.architecture || challenge.trafficDistribution) && (
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'architecture'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>Architecture & Topology</span>
          </button>
        )}

        {challenge.questions && challenge.questions.length > 0 && (
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'questions'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Deep-Dive Questions ({challenge.questions.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'benchmark'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Report & Benchmarks</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SCENARIO */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Scenario Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-3.5 shadow-2xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Terminal className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
              <span>Test Scenario & Workload Description</span>
            </h2>
            <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 p-4 font-mono text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
              {challenge.scenario}
            </div>

            {challenge.loadProfile && (
              <div className="pt-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Load Profile: </span>
                <span className="text-xs font-mono text-purple-600 dark:text-purple-400">{challenge.loadProfile}</span>
              </div>
            )}
          </div>

          {/* Must Have / Expected Result alerts if present */}
          {(challenge.mustHave || challenge.expectedResult) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {challenge.mustHave && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Must Have Pre-requisite</span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200 font-mono leading-relaxed">
                    {challenge.mustHave}
                  </p>
                </div>
              )}

              {challenge.expectedResult && (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Expected Result Behavior</span>
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 font-mono leading-relaxed">
                    {challenge.expectedResult}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success Criteria & Metrics to Measure */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Success Criteria */}
            {challenge.successCriteria && challenge.successCriteria.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Success Criteria & Pass Thresholds</span>
                </div>
                <ul className="space-y-2">
                  {challenge.successCriteria.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metrics to Measure */}
            {challenge.metricsToMeasure && challenge.metricsToMeasure.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span>Key Metrics to Record</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {challenge.metricsToMeasure.map((metric, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl border border-purple-200/80 bg-purple-50/70 dark:border-purple-800/60 dark:bg-purple-950/40 px-3 py-1.5 text-xs font-mono text-purple-700 dark:text-purple-300"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Requirements List if present */}
          {challenge.requirements && challenge.requirements.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Layers className="h-4 w-4 text-indigo-500" />
                <span>Production Architecture Requirements</span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {challenge.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-3 text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="font-bold text-purple-600 dark:text-purple-400">#{idx + 1}</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: K6 TEST SCRIPT */}
      {activeTab === 'script' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Executable k6 Test Script</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Simpan file ini sebagai <code className="text-purple-600 dark:text-purple-400">test-{challenge.id}.js</code> dan jalankan langsung menggunakan binary k6.
                </p>
              </div>

              <button
                onClick={handleCopyScript}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-purple-700 transition-colors shrink-0"
              >
                {copiedScript ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Script Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy k6 Script</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Box */}
            <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-purple-300 overflow-x-auto leading-relaxed shadow-inner">
              <div className="pb-3 mb-3 border-b border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>// k6 load test script for Challenge {challenge.number}</span>
                <span className="text-[10px] text-zinc-500">ECMAScript 6 (k6 runtime)</span>
              </div>
              <pre>{challenge.k6Script || '// No script provided for this challenge'}</pre>
            </div>

            {/* CLI Execution Command Box */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-4 space-y-2">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-zinc-500" />
                <span>How to execute:</span>
              </div>
              <div className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-mono text-emerald-400 overflow-x-auto">
                k6 run test-{challenge.id}.js
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Optional: Tambahkan flags <code className="text-zinc-700 dark:text-zinc-300 font-mono">--out influxdb=http://localhost:8086/k6</code> untuk streaming metrik real-time ke Grafana Dashboard.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE & TOPOLOGY */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {challenge.architecture && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-2xs">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Architecture Topology Diagram</span>
              </h2>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed shadow-inner">
                <pre>{challenge.architecture}</pre>
              </div>
            </div>
          )}

          {challenge.trafficDistribution && challenge.trafficDistribution.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-2xs">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>Traffic Distribution Breakdown</span>
              </h2>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Endpoint</th>
                      <th className="px-4 py-3">Traffic Weight</th>
                      <th className="px-4 py-3">Workload Characteristic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                    {challenge.trafficDistribution.map((td, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {td.endpoint}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {td.weight}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {td.type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DEEP-DIVE QUESTIONS */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-2 shadow-2xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Engineering Investigation Questions</span>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Jawab pertanyaan-pertanyaan ini setelah menjalankan test untuk memahami mekanisme bottleneck dan root cause. Klik pertanyaan untuk melihat engineering insights.
            </p>
          </div>

          <div className="space-y-3">
            {(challenge.questions || []).map((question, qIdx) => {
              const isAnswerOpen = !!expandedAnswers[qIdx];
              const hint = challenge.answersOrHints && challenge.answersOrHints[qIdx];

              return (
                <div
                  key={qIdx}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 sm:p-5 transition-all shadow-2xs"
                >
                  <button
                    onClick={() => toggleAnswer(qIdx)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-950 text-[10px] font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {question}
                      </span>
                    </div>
                    {isAnswerOpen ? (
                      <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {isAnswerOpen && (
                    <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50/70 dark:bg-zinc-950/40 p-3.5 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 mb-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Engineering Insight & Analysis:</span>
                      </div>
                      <p>{hint || 'Jalankan k6 test dan amati metrik Grafana (p95 latency curve, connection pool wait time, CPU utilization) untuk membuktikan jawaban ini secara empiris.'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: PERFORMANCE REPORT & BENCHMARKS */}
      {activeTab === 'benchmark' && (
        <div className="space-y-6">
          {/* Benchmark comparison table if present */}
          {challenge.benchmarkData && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-2xs">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
                <span>Empirical Benchmark Results (Before vs After)</span>
              </h2>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Performance Metric</th>
                      <th className="px-4 py-3 text-red-600 dark:text-red-400">Before Optimization</th>
                      <th className="px-4 py-3 text-emerald-600 dark:text-emerald-400">After Optimization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    {challenge.benchmarkData.metrics.map((m, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                        <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100 font-sans">
                          {m}
                        </td>
                        <td className="px-4 py-3 text-red-600 dark:text-red-400 font-semibold">
                          {challenge.benchmarkData?.before[idx]}
                        </td>
                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">
                          {challenge.benchmarkData?.after[idx]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Performance Report Generator */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Generate Markdown Report for this Challenge</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Export format laporan siap isi untuk didokumentasikan di repository tim.
                </p>
              </div>

              <button
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-purple-700 transition-colors shrink-0"
              >
                {copiedReport ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Markdown Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation between challenges */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {prevChallenge ? (
          <Link
            href={`/technology/k6-challenges/${prevChallenge.id}`}
            className="flex items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60 hover:border-purple-300 dark:hover:border-purple-700 transition-colors shadow-2xs w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-400 shrink-0" />
            <div className="text-left min-w-0">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Tantangan Sebelumnya</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                Ch. {prevChallenge.number} — {prevChallenge.title}
              </span>
            </div>
          </Link>
        ) : <div />}

        {nextChallenge && (
          <Link
            href={`/technology/k6-challenges/${nextChallenge.id}`}
            className="flex items-center justify-end gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60 hover:border-purple-300 dark:hover:border-purple-700 transition-colors shadow-2xs w-full sm:w-auto sm:ml-auto"
          >
            <div className="text-right min-w-0">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Tantangan Berikutnya</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                Ch. {nextChallenge.number} — {nextChallenge.title}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}
