import Link from 'next/link';
import { ArrowLeft, FileText, Terminal, Code2, CheckCircle2, Layers } from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { standardService } from '@/features/standard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Logging & Observability Standards — Software Engineering Standardization',
  description: 'Standards for structured logging levels, common schema fields, log categories, and framework implementations for .NET, Laravel, NestJS, and Express.js.',
};

export default async function LoggingPage() {
  const loggingStandard = await standardService.getLoggingStandard();

  const sampleJson = `{
  "timestamp": "2026-08-14T10:30:00.000Z",
  "level": "Information",
  "service": "project-management-api",
  "environment": "production",
  "category": "API",
  "correlationId": "c3b9e4a1-8d2b-42b7-9571-0428d9d4bf92",
  "requestId": "req-98471",
  "traceId": "0af7651916cd43dd8448eb211c80319c",
  "userId": "usr_94821",
  "endpoint": "/api/v1/projects",
  "method": "POST",
  "statusCode": 200,
  "durationMs": 45.2,
  "message": "Project created successfully"
}`;

  return (
    <PortalLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Back button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home Overview</span>
          </Link>
        </div>

        {/* Category Header */}
        <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 shadow-2xs">
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Logging & Observability Standard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Format: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{loggingStandard.format}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Framework Implementations Section (.NET, Laravel, NestJS, Express.js) */}
        {loggingStandard.frameworkImplementations && loggingStandard.frameworkImplementations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Framework Implementation Standards
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Standardized logging setups, libraries, and code patterns for .NET, Laravel / PHP, NestJS, and Express.js.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {loggingStandard.frameworkImplementations.map((fw) => (
                <div
                  key={fw.slug}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-zinc-500" />
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {fw.framework}
                        </h3>
                      </div>
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {fw.library}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {fw.description}
                    </p>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300 overflow-x-auto shadow-inner">
                      <pre>{fw.codeSnippet}</pre>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Key Capabilities:
                    </span>
                    <ul className="space-y-1">
                      {fw.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Levels & Categories (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Log Levels */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Standard Log Levels
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {loggingStandard.levels.map((lvl) => (
                  <div
                    key={lvl.level}
                    className="rounded-xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs"
                  >
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                      {lvl.level}
                    </span>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {lvl.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Log Categories */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Log Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {loggingStandard.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 shadow-2xs"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </section>

            {/* Standard JSON Format Preview */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-600" />
                <span>Standard Structured JSON Schema</span>
              </h2>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto shadow-inner">
                <pre>{sampleJson}</pre>
              </div>
            </section>
          </div>

          {/* Right Column: Standard Fields Table (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Standard Schema Fields
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                  <tr>
                    <th className="px-3.5 py-2.5 font-bold">Field</th>
                    <th className="px-3.5 py-2.5 font-bold">Type</th>
                    <th className="px-3.5 py-2.5 font-bold">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {loggingStandard.standardFields.map((field) => (
                    <tr key={field.field} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                      <td className="px-3.5 py-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {field.field}
                      </td>
                      <td className="px-3.5 py-2 text-zinc-500 dark:text-zinc-400">
                        {field.type}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-zinc-600 dark:text-zinc-300 truncate max-w-[140px]">
                        {field.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
