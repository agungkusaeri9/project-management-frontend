import Link from 'next/link';
import {
  ArrowLeft,
  GitBranch,
  ExternalLink,
  Tag,
  FolderGit2,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { standardService } from '@/features/standard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Versioning & Git Strategy Standard — Software Engineering Standardization',
  description: 'Standards for Semantic Versioning (SemVer 2.0.0), API Versioning, Git Branching Strategy (Git Flow), and Conventional Commits 1.0.0.',
};

export default async function VersioningPage() {
  const versioningStandard = await standardService.getVersioningStandard();
  const { semanticVersioning, apiVersioning, gitBranching, commitConvention } = versioningStandard;

  return (
    <PortalLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home Overview</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 shadow-2xs">
              <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Versioning & Git Strategy Standard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Semantic Versioning, pre-release maturation, API routing versioning, Git Flow branching, and commit conventions.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Card: Semantic Versioning Link */}
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/20 p-6 dark:border-blue-500/20 dark:from-blue-950/20 dark:via-zinc-900 dark:to-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Semantic Versioning (SemVer 2.0.0) & Release Pipeline
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Detailed rules for MAJOR.MINOR.PATCH progression and the 4 sequential pre-release lifecycle stages: <strong className="text-amber-600 dark:text-amber-400">Alpha</strong>, <strong className="text-blue-600 dark:text-blue-400">Beta</strong>, <strong className="text-purple-600 dark:text-purple-400">Release Candidate (RC)</strong>, and <strong className="text-emerald-600 dark:text-emerald-400">Stable</strong>.
            </p>
          </div>

          <Link
            href="/technology/semantic"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-xs font-bold text-white shadow-sm transition-colors shrink-0"
          >
            <span>Explore Semantic Lifecycle</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* API Versioning Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              API Versioning Standards
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Strategy</span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{apiVersioning.strategy}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">URI Pattern</span>
                <code className="font-mono text-xs text-blue-600 dark:text-blue-400">{apiVersioning.uriPattern}</code>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Guidelines & Deprecation:</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{apiVersioning.deprecationPolicy}</p>
              <ul className="space-y-1 pt-1">
                {apiVersioning.guidelines.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Git Branching (Git Flow) & Conventional Commits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branching Strategy */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Git Branching Strategy ({gitBranching.model})
              </h2>
            </div>

            <div className="space-y-3">
              {gitBranching.branches.map((b) => (
                <div
                  key={b.name}
                  className="rounded-xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{b.name}</span>
                    {b.protection && (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Protected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{b.purpose}</p>
                  {b.naming && (
                    <span className="font-mono text-[11px] text-zinc-400 block pt-1">Example: {b.naming}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Commit Convention */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Conventional Commits ({commitConvention.format})
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {commitConvention.types.map((t) => (
                  <div key={t.type} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-800/60 dark:bg-zinc-950/40">
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{t.type}</span>
                    <span className="block text-[11px] text-zinc-500 truncate">{t.description}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Examples:</span>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-emerald-400 space-y-1">
                  {commitConvention.examples.map((ex, idx) => (
                    <div key={idx}>{ex}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PortalLayout>
  );
}
