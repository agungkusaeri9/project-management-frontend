import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, KeyRound, AlertTriangle } from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { standardService } from '@/features/standard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Security Standards — Software Engineering Standardization',
  description: 'Standards for authentication, authorization, app security, and secret management.',
};

export default async function SecurityPage() {
  const securityStandard = await standardService.getSecurityStandard();

  return (
    <PortalLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
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
              <ShieldCheck className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Security Standards & Best Practices
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Authentication protocols, access control, OWASP mitigations, and secret hygiene.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Auth & Access Control (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-indigo-600" />
                <span>Authentication Standards</span>
              </h2>
              <div className="space-y-3">
                {securityStandard.authentication.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs"
                  >
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>Authorization Models</span>
              </h2>
              <div className="space-y-3">
                {securityStandard.authorization.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs"
                  >
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: App Security & Secret Management (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Application Security */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Application Security Best Practices
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {securityStandard.applicationSecurity.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border border-zinc-200/90 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-2xs"
                  >
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Secret Management */}
            <section className="space-y-3">
              <div className="rounded-2xl border border-red-200/80 bg-red-50/40 p-5 dark:border-red-950/60 dark:bg-red-950/15 shadow-2xs">
                <div className="flex items-center gap-2 text-red-900 dark:text-red-300 mb-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <h2 className="text-sm font-bold">Secret Management Rules</h2>
                </div>

                <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                  {securityStandard.secretManagement.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 border-t border-red-200/60 dark:border-red-900/40">
                  <span className="text-xs font-semibold text-red-800 dark:text-red-400 block mb-2">
                    Prohibited in Git / Source Repositories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {securityStandard.secretManagement.prohibitedInSource.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-red-100/90 px-2 py-0.5 font-mono text-[11px] font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
