import Link from 'next/link';
import { ArrowLeft, ArrowRight, Layers, Sparkles, FileDown } from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { standardService, TechnologyItem } from '@/features/standard';

export const metadata = {
  title: 'Technology Stack Standard — Software Engineering Standardization',
  description: 'Standardized technologies for frontend, backend, mobile, database, and supporting services.',
};

export default async function TechnologyPage() {
  const technologyCatalog = await standardService.getTechnologyCatalog();

  const sections: { title: string; items: TechnologyItem[] }[] = [
    { title: 'Frontend', items: technologyCatalog.frontend || [] },
    { title: 'Backend', items: technologyCatalog.backend || [] },
    { title: 'Mobile', items: technologyCatalog.mobile || [] },
    { title: 'Database', items: technologyCatalog.database || [] },
    { title: 'Supporting Services & Message Brokers', items: technologyCatalog.supporting || [] },
  ];

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
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Technology Stack Standard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Approved programming languages, frameworks, databases, and middleware services.
              </p>
            </div>
          </div>

          <a
            href={standardService.getTechnologyPdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <FileDown className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            <span>Export PDF (A4)</span>
          </a>
        </div>

        {/* Catalog Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{section.title}</span>
                <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 font-mono">
                  ({section.items.length} standards)
                </span>
              </h2>

              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.items.map((item) => {
                  if (item.href) {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-white p-4 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50/80 hover:shadow-xs dark:border-zinc-800/90 dark:bg-zinc-900/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/80"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                                {item.name}
                              </span>
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-1.5 py-0.5 text-[10px] font-medium">
                                <Sparkles className="h-2.5 w-2.5" />
                                Relationship
                              </span>
                            </div>
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {item.type}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                          <span>View Technology Relationship</span>
                          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={item.name}
                      className="rounded-xl border border-zinc-200/90 bg-white p-4 transition-all hover:border-zinc-300 dark:border-zinc-800/90 dark:bg-zinc-900/40 dark:hover:border-zinc-700 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          {item.name}
                        </span>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
