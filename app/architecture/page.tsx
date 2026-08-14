import Link from 'next/link';
import { ArrowLeft, Network, FileDown } from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { standardService } from '@/features/standard';

export const metadata = {
  title: 'Architecture Patterns — Software Engineering Standardization',
  description: 'Approved software architecture patterns, dependency rules, and project structures.',
};

export default async function ArchitecturePage() {
  const architectureCatalog = await standardService.getArchitectureCatalog();

  return (
    <PortalLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home Overview</span>
          </Link>
        </div>

        {/* Category Header with Export PDF Button */}
        <div className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 shadow-2xs">
              <Network className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Architecture Patterns
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Approved architectural paradigms, layer separation rules, and project organization.
              </p>
            </div>
          </div>

          <a
            href={standardService.getArchitecturePdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <FileDown className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            <span>Export PDF (A4)</span>
          </a>
        </div>

        {/* Architecture Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {architectureCatalog.map((arch) => (
            <div
              key={arch.name}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {arch.name}
                  </h2>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {arch.description}
                </p>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Use Case
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">{arch.useCase}</span>
                  </div>

                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Project Structure
                    </span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">{arch.projectStructure}</span>
                  </div>

                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Dependency Rules
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">{arch.dependencyRules}</span>
                  </div>
                </div>
              </div>

              {arch.recommendedTech && (
                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 mr-1 font-medium">Recommended for:</span>
                  {arch.recommendedTech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
