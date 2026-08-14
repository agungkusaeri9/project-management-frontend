import Link from 'next/link';
import {
  ArrowLeft,
  Code2,
  Database,
  ShieldCheck,
  FileText,
  Server,
  Terminal,
  Activity,
  Network,
  Cpu,
  Boxes,
  CheckCircle2,
  GitBranch,
  TableProperties,
  FileDown,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { standardService } from '@/features/standard';

export const metadata = {
  title: '.NET Technology Relationship Standard — Software Engineering Standardization',
  description:
    'Comprehensive specification of .NET architecture, data access, validation, logging, messaging, and deployment relationships.',
};

export default async function DotnetRelationshipPage() {
  const dotnetData = await standardService.getTechnologyRelationship('dotnet');

  return (
    <PortalLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div>
          {/* Breadcrumbs / Back Navigation */}
          <div className="mb-6 flex items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Link
              href="/technology"
              className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Technology Stack</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
              .NET Relationship
            </span>
          </div>

          {/* Page Hero */}
          <div className="mb-10 border-b border-zinc-200 pb-6 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 shadow-xs">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Backend Standard
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">v1.0</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {dotnetData.title}
                  </h1>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    {dotnetData.subtitle}
                  </p>
                </div>
              </div>

              <a
                href={standardService.getDotnetPdfUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-xs hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
              >
                <FileDown className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <span>Export PDF (A4)</span>
              </a>
            </div>

            {/* Quick Summary Pill Highlights */}
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <strong>Language:</strong> C#
              </span>
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <strong>Framework:</strong> ASP.NET Core
              </span>
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <strong>Default Architecture:</strong> Clean Architecture
              </span>
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <strong>ORM:</strong> EF Core + Dapper
              </span>
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <strong>Logging:</strong> Serilog
              </span>
            </div>
          </div>

          <div className="space-y-12">
            {/* 3.1 Core Technology */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  3.1 Core Technology Stack
                </h2>
              </div>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Technology</th>
                      <th className="px-4 py-3 font-semibold">Relationship / Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {dotnetData.coreTechnology.map((item) => (
                      <tr key={item.category} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                        <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                          {item.category}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-zinc-800 dark:text-zinc-200">
                          {item.technology}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                          {item.usage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3.1 Architecture Patterns */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Architecture Patterns
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Repository + Service */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                      Repository + Service
                    </h3>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Standard CRUD
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Cocok untuk aplikasi dengan struktur sederhana sampai menengah.
                  </p>
                  <div className="rounded-lg bg-zinc-950 p-3 font-mono text-xs text-emerald-400">
                    <pre className="whitespace-pre">{`Controller\n    ↓\nService\n    ↓\nRepository\n    ↓\nDatabase`}</pre>
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <p>• <strong>Controller:</strong> Menangani HTTP request dan response.</p>
                    <p>• <strong>Service:</strong> Menangani business logic.</p>
                    <p>• <strong>Repository:</strong> Menangani isolasi database access.</p>
                  </div>
                </div>

                {/* Clean Architecture */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                      Clean Architecture
                    </h3>
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
                      Recommended Enterprise
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Direkomendasikan untuk aplikasi dengan business logic kompleks dan maintainability jangka panjang.
                  </p>
                  <div className="rounded-lg bg-zinc-950 p-3 font-mono text-xs text-emerald-400">
                    <pre className="whitespace-pre">{`API / Presentation\n        ↓\nApplication\n        ↓\nDomain\n        ↓\nInfrastructure`}</pre>
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <p>• <strong>API:</strong> Controller, Middleware, Authentication</p>
                    <p>• <strong>Application:</strong> Service, Use Case, DTO, Validation</p>
                    <p>• <strong>Domain:</strong> Entity, Enum, Business Rule</p>
                    <p>• <strong>Infrastructure:</strong> EF Core, Dapper, External API</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3.2 Data Access Relationship */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  3.2 Data Access Relationship (EF Core vs Dapper)
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-2">
                    Entity Framework Core (Default ORM)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 font-mono">
                    Service ➔ Repository ➔ EF Core ➔ Database
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {dotnetData.dataAccess.efCore.whenToUse.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-2">
                    Dapper (Micro ORM)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 font-mono">
                    Service ➔ Repository ➔ Dapper ➔ SQL Query ➔ Database
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {dotnetData.dataAccess.dapper.whenToUse.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hybrid Guideline Box */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Hybrid Strategy Guideline
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {dotnetData.dataAccess.hybrid.guideline}
                </p>
              </div>
            </section>

            {/* 3.3 Validation & 3.4 Logging */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Validation */}
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    3.3 Validation Pipeline
                  </h2>
                </div>
                <div className="rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300">
                  {dotnetData.validation.flow}
                </div>
                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <p>• <strong>Recommended:</strong> FluentValidation (rule terpisah dari DTO)</p>
                  <p>• <strong>Alternatives:</strong> Data Annotations, Custom Validation</p>
                </div>
                <div className="border-t border-zinc-100 pt-2 dark:border-zinc-800 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {dotnetData.validation.guidelines.map((g) => (
                    <p key={g}>• {g}</p>
                  ))}
                </div>
              </section>

              {/* Logging */}
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    3.4 Structured Logging (Serilog)
                  </h2>
                </div>
                <div className="rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300">
                  {dotnetData.logging.flow}
                </div>
                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <p>• <strong>Framework:</strong> Serilog (Structured JSON)</p>
                  <p>• <strong>Sinks:</strong> Console (Dev), File, Elasticsearch / Loki / Seq</p>
                </div>
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-800 dark:bg-red-950/30 dark:text-red-300 space-y-1">
                  <p className="font-semibold">Sanitization Rules:</p>
                  {dotnetData.logging.sanitizationRules.map((r) => (
                    <p key={r}>- {r}</p>
                  ))}
                </div>
              </section>
            </div>

            {/* 3.5 Auth & 3.6 Background Jobs */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Auth */}
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    3.5 Auth & Authorization
                  </h2>
                </div>
                <div className="rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300">
                  {dotnetData.auth.flow}
                </div>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {dotnetData.auth.technologies.map((t) => (
                    <div key={t.name} className="border-b border-zinc-100 pb-1.5 dark:border-zinc-800/80">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</span>
                      <p className="text-zinc-500 dark:text-zinc-400">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Background Jobs */}
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    3.6 Background Jobs
                  </h2>
                </div>
                <div className="rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300">
                  {dotnetData.backgroundJobs.flow}
                </div>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="border-b border-zinc-100 pb-1.5 dark:border-zinc-800/80">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      BackgroundService / IHostedService
                    </span>
                    <p className="text-zinc-500 dark:text-zinc-400">{dotnetData.backgroundJobs.simple.useCase}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Hangfire / Quartz.NET
                    </span>
                    <p className="text-zinc-500 dark:text-zinc-400">{dotnetData.backgroundJobs.advanced.useCase}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* 3.7 Messaging & 3.8 Caching */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Messaging */}
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    3.7 Messaging Relationships
                  </h2>
                </div>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {dotnetData.messaging.technologies.map((m) => (
                    <div key={m.name} className="border-b border-zinc-100 pb-1.5 dark:border-zinc-800/80">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.name}</span>
                      <p className="text-zinc-500 dark:text-zinc-400">{m.fit}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Caching */}
              <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    3.8 Caching Strategy
                  </h2>
                </div>
                <div className="rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300">
                  {dotnetData.caching.flow}
                </div>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="border-b border-zinc-100 pb-1.5 dark:border-zinc-800/80">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{dotnetData.caching.inMemory.name}</span>
                    <p className="text-zinc-500 dark:text-zinc-400">{dotnetData.caching.inMemory.useCase}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{dotnetData.caching.distributed.name}</span>
                    <p className="text-zinc-500 dark:text-zinc-400">{dotnetData.caching.distributed.useCase}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* 3.9 Testing Strategy */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  3.9 Testing Relationship
                </h2>
              </div>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Testing Type</th>
                      <th className="px-4 py-2.5 font-semibold">Technology</th>
                      <th className="px-4 py-2.5 font-semibold">Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {dotnetData.testing.map((t) => (
                      <tr key={t.type} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                        <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                          {t.type}
                        </td>
                        <td className="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                          {t.technology}
                        </td>
                        <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                          {t.scope}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3.10 & 3.11 Containerization & Deployment */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  3.10 & 3.11 Containerization & Deployment
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {dotnetData.deployment.map((dep) => (
                  <div
                    key={dep.method}
                    className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-2.5"
                  >
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {dep.method}
                    </h3>
                    <div className="rounded-lg bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300">
                      {dep.flow}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dep.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3.15 Recommended .NET Stack Summary Tree */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  3.15 Recommended .NET Architecture Tree
                </h2>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-zinc-200 shadow-inner">
                <pre className="whitespace-pre leading-relaxed">{`Language
└── C#

Framework
└── ASP.NET Core Web API

Architecture
└── Clean Architecture

ORM / Data Access
├── Entity Framework Core (Default CRUD)
└── Dapper (Reporting & Raw SQL)

Validation
└── FluentValidation

Logging
└── Serilog (Structured JSON)

Authentication
└── JWT Bearer Token

Background Job
├── BackgroundService
└── Hangfire / Quartz.NET

Messaging
├── RabbitMQ (Backend-to-Backend)
└── MQTT (IoT & Telemetry)

Caching
└── Redis

Testing
├── xUnit
├── Moq / NSubstitute
└── Testcontainers

API Documentation
└── Swagger / OpenAPI

Containerization
└── Docker / Docker Compose

Deployment
├── Docker + Linux VM
└── Kubernetes (K8s)

CI/CD
├── GitHub Actions
├── GitLab CI/CD
└── Azure DevOps

Observability
├── Serilog
├── OpenTelemetry
├── Prometheus
└── Grafana`}</pre>
              </div>
            </section>

            {/* 3.16 Technology Relationship Matrix */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <TableProperties className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  3.16 Technology Relationship Matrix
                </h2>
              </div>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Area</th>
                      <th className="px-4 py-3 font-semibold">Default Technology</th>
                      <th className="px-4 py-3 font-semibold">Alternative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {dotnetData.matrix.map((row) => (
                      <tr key={row.area} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                        <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                          {row.area}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400">
                          {row.default}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                          {row.alternative}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
