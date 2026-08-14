import Link from 'next/link';
import { ArrowLeft, Server, Check, AlertCircle } from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { standardService } from '@/features/standard';

export const metadata = {
  title: 'Deployment Standards — Software Engineering Standardization',
  description: 'Standards for containerization, service hosting, reverse proxies, and Kubernetes.',
};

export default async function DeploymentPage() {
  const deploymentCatalog = await standardService.getDeploymentCatalog();

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

        {/* Category Header */}
        <div className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 shadow-2xs">
              <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Deployment & Infrastructure Standards
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Packaging, containerization, hosting environments, and runtime requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Deployment Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deploymentCatalog.map((dep) => (
            <div
              key={dep.name}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 shadow-2xs"
            >
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {dep.name}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {dep.description}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Use Case
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">{dep.useCase}</span>
                  </div>

                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Requirements
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {dep.requirements.map((req) => (
                        <span
                          key={req}
                          className="font-mono text-[11px] rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40 sm:col-span-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                      Deployment Flow
                    </span>
                    <code className="font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded block text-xs">
                      {dep.deploymentFlow}
                    </code>
                  </div>

                  {/* Advantages & Disadvantages */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 dark:border-emerald-950/60 dark:bg-emerald-950/10">
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 block mb-1.5">
                      Advantages
                    </span>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 text-xs">
                      {dep.advantages.map((adv) => (
                        <li key={adv} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 dark:border-amber-950/60 dark:bg-amber-950/10">
                    <span className="font-bold text-amber-800 dark:text-amber-400 block mb-1.5">
                      Trade-offs
                    </span>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 text-xs">
                      {dep.disadvantages.map((dis) => (
                        <li key={dis} className="flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />
                          <span>{dis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
