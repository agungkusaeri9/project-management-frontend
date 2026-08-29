import Link from 'next/link';
import {
  ArrowLeft,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  ShieldCheck,
  Zap,
  Sparkles,
  Clock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout';
import { standardService } from '@/features/standard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Standar Semantic Versioning (SemVer) — Siklus Rilis Alpha, Beta, RC & Stabil',
  description:
    'Standar penomoran rilis software Semantic Versioning 2.0.0, tahap awal pengembangan proyek (v0.1.0-alpha), pipeline siklus pre-release (Alpha, Beta, RC, Stabil), dan best practice tag Git.',
};

export default async function SemanticVersioningPage() {
  const versioningStandard = await standardService.getVersioningStandard();
  const semver = versioningStandard.semanticVersioning;

  const defaultStages = [
    {
      stage: 'Alpha',
      tag: '-alpha.N',
      example: 'v0.1.0-alpha.1',
      badge: 'Fase Alpha',
      color: 'amber',
      audience: 'Developer Internal & Tim QA Inti',
      stability: 'Eksperimental / Awal Pengembangan',
      environment: 'Development / Lokal / Sandbox',
      description:
        'Tahap aktif pembuatan fitur awal sejak awal pembangunan struktur proyek (v0.1.0-alpha.1). Fitur mungkin belum lengkap, API bersifat eksperimental dan dapat berubah tanpa pemberitahuan sebelumnya, serta logging debug aktif.',
      bestPractices: [
        'Proyek baru dimulai dari v0.1.0-alpha.1 untuk modul atau prototipe pertama.',
        'Dibuat secara otomatis oleh pipeline CI dari branch fitur aktif atau build harian.',
        'Dibatasi ketat hanya untuk pengujian internal developer & QA; tidak boleh diekspos ke klien.',
        'Perubahan breaking changes sepenuhnya diizinkan dalam revisi alpha.',
      ],
    },
    {
      stage: 'Beta',
      tag: '-beta.N',
      example: 'v0.1.0-beta.1',
      badge: 'Fase Beta',
      color: 'blue',
      audience: 'QA Engineer, Tester UAT, Pengguna Awal',
      stability: 'Fitur Lengkap (Freeze) / Validasi',
      environment: 'Lingkungan Staging / UAT',
      description:
        'Seluruh ruang lingkup fitur yang direncanakan telah selesai dibuat dan digabungkan (Feature Freeze). Fokus beralih ke pencarian bug, profiling performa, pengujian integrasi, dan umpan balik pengguna.',
      bestPractices: [
        'Feature Freeze diterapkan ketat: tidak ada penambahan fitur baru atau refactor besar.',
        'Dideploy ke Staging / UAT untuk proses persetujuan dan verifikasi stakeholder.',
        'Bug yang ditemukan diperbaiki dan dirilis dengan nomor tag beta berikutnya (misal v0.1.0-beta.2).',
      ],
    },
    {
      stage: 'Release Candidate (RC)',
      tag: '-rc.N',
      example: 'v0.1.0-rc.1',
      badge: 'Kandidat Rilis (RC)',
      color: 'purple',
      audience: 'Lead QA, DevOps, Auditor Keamanan, Product Owner',
      stability: 'Mendekati 100% Siap Produksi',
      environment: 'Pre-Production / Mirror Staging',
      description:
        'Build kandidat final yang diyakini telah siap masuk ke lingkungan produksi. Diuji menggunakan data riil tiruan produksi, pemindaian keamanan, dan simulasi beban kerja puncak sebelum dipromosikan.',
      bestPractices: [
        'Hanya perbaikan bug regresi kritis atau patch keamanan tingkat tinggi yang diizinkan.',
        'Jika ada perubahan kode, nomor RC baru wajib di-tag (misal v0.1.0-rc.2).',
        'Wajib mendapatkan persetujuan akhir (sign-off) dari Lead QA dan Product Owner sebelum rilis stabil.',
      ],
    },
    {
      stage: 'Stabil (Ketersediaan Umum / GA)',
      tag: 'vX.Y.Z',
      example: 'v1.0.0',
      badge: 'Rilis Stabil Resmi (GA)',
      color: 'emerald',
      audience: 'Seluruh Klien Produksi & Pengguna Publik',
      stability: 'SLA Produksi / Terverifikasi Penuh',
      environment: 'Lingkungan Produksi (Live)',
      description:
        'Rilis resmi produksi yang telah lolos seluruh pengujian pada siklus RC. Menandai peralihan dari tahap pengembangan awal (v0.y.z) menuju garansi kompatibilitas ke belakang dan SLA produksi resmi (v1.0.0+).',
      bestPractices: [
        'v0.1.0 mendefinisikan baseline stabil internal untuk modul pertama yang selesai.',
        'v1.0.0 mendefinisikan standar baseline API publik resmi untuk lingkungan produksi.',
        'Di-tag langsung pada branch main / release setelah versi RC lolos seluruh kriteria.',
        'Disertai dengan Catatan Rilis (Release Notes), Panduan Migrasi, dan Changelog otomatis.',
        'Tag Git bersifat immutable (tidak boleh diubah atau ditimpa setelah di-push).',
      ],
    },
  ];

  const stages = semver.lifecycleStages && semver.lifecycleStages.length > 0 ? semver.lifecycleStages : defaultStages;

  const stageColorMap: Record<string, { bg: string; text: string; border: string; badgeBg: string }> = {
    amber: {
      bg: 'bg-amber-500/5',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      badgeBg: 'bg-amber-500/10',
    },
    blue: {
      bg: 'bg-blue-500/5',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
      badgeBg: 'bg-blue-500/10',
    },
    purple: {
      bg: 'bg-purple-500/5',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20',
      badgeBg: 'bg-purple-500/10',
    },
    emerald: {
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      badgeBg: 'bg-emerald-500/10',
    },
  };

  return (
    <PortalLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/technology"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Daftar Teknologi</span>
          </Link>

          <Link
            href="/versioning"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <span>Seluruh Strategi Versioning & Git</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Header Banner */}
        <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100/60 p-6 sm:p-8 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900/60 dark:to-zinc-950 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                <GitBranch className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Standar Resmi
                  </span>
                  <span className="rounded-full bg-zinc-200/80 dark:bg-zinc-800 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    SemVer 2.0.0
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Semantic Versioning & Siklus Hidup Rilis
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                  Standar penomoran rilis software mulai dari Tahap Awal Proyek (<code className="font-mono text-zinc-800 dark:text-zinc-200">v0.1.0-alpha.1</code>) hingga Ketersediaan Produksi Resmi (<code className="font-mono text-zinc-800 dark:text-zinc-200">v1.0.0</code>).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-3.5 text-center shadow-xs">
                <span className="block font-mono text-lg font-black text-zinc-900 dark:text-zinc-50">
                  MAJOR.MINOR.PATCH
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Formula Versi Kanonikal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SemVer Clause 4: Initial Development Callout */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 p-6 dark:border-amber-500/20 dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Penerapan Alpha, Beta, RC, dan Stabil pada Proyek Baru (v0.y.z) & Produksi (v1.y.z)
              </h2>
            </div>
            <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
              Klausul 4 & Klausul 9 SemVer
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Seluruh tahapan <strong>Alpha</strong>, <strong>Beta</strong>, <strong>Release Candidate (RC)</strong>, dan <strong>Stabil</strong> berlaku di kedua fase software: baik saat <strong>proyek baru dibangun dari nol (<code className="font-mono text-amber-700 dark:text-amber-300">0.y.z</code>)</strong> maupun saat <strong>software sudah rilis di produksi (<code className="font-mono text-emerald-700 dark:text-emerald-300">1.y.z / 2.y.z</code>)</strong>.
          </p>

          {/* Matrix Table: 0.y.z vs 1.y.z */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50/90 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-3 font-bold">Tahapan Rilis</th>
                  <th className="px-4 py-3 font-bold text-amber-700 dark:text-amber-400">1. Proyek Baru (Initial Dev 0.y.z)</th>
                  <th className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">2. Rilis Produksi & Seterusnya (1.y.z+)</th>
                  <th className="px-4 py-3 font-bold">Target Lingkungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                  <td className="px-4 py-2.5 font-sans font-bold text-amber-600 dark:text-amber-400">
                    Fase Alpha
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    v0.1.0-alpha.1
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-300">
                    v1.1.0-alpha.1, v2.0.0-alpha.1
                  </td>
                  <td className="px-4 py-2.5 font-sans text-zinc-500">Development / Lokal</td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                  <td className="px-4 py-2.5 font-sans font-bold text-blue-600 dark:text-blue-400">
                    Fase Beta
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    v0.1.0-beta.1
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-300">
                    v1.1.0-beta.1, v2.0.0-beta.1
                  </td>
                  <td className="px-4 py-2.5 font-sans text-zinc-500">Staging / UAT</td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                  <td className="px-4 py-2.5 font-sans font-bold text-purple-600 dark:text-purple-400">
                    Kandidat Rilis (RC)
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    v0.1.0-rc.1
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-300">
                    v1.0.0-rc.1, v1.1.0-rc.1
                  </td>
                  <td className="px-4 py-2.5 font-sans text-zinc-500">Pre-Production</td>
                </tr>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 bg-emerald-500/5">
                  <td className="px-4 py-2.5 font-sans font-bold text-emerald-600 dark:text-emerald-400">
                    Rilis Stabil Resmi
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    v0.1.0 (Baseline Internal)
                  </td>
                  <td className="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                    v1.0.0 (Produksi GA Pertama)
                  </td>
                  <td className="px-4 py-2.5 font-sans text-emerald-700 dark:text-emerald-300 font-semibold">Produksi (Live)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 font-mono text-[11px] text-amber-900 dark:text-amber-200 overflow-x-auto shadow-inner">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-sans font-bold uppercase tracking-wider block mb-1">
              Alur Lengkap Perkembangan Rilis:
            </span>
            <div>
              v0.1.0-alpha.1 ➔ v0.1.0-beta.1 ➔ v0.1.0-rc.1 ➔ v0.1.0 ➔ v0.2.0-alpha.1 ➔ ... ➔ v1.0.0-rc.1 ➔ <strong className="text-emerald-600 dark:text-emerald-400">v1.0.0 (Rilis Produksi GA Pertama)</strong>
            </div>
          </div>
        </div>

        {/* Core Formula Cards */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Aturan Spesifikasi Inti SemVer
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* MAJOR */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-2 dark:border-red-500/20">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-black text-red-600 dark:text-red-400">
                  MAJOR (Mayor)
                </span>
                <span className="rounded-md bg-red-500/10 px-2 py-0.5 font-mono text-xs font-bold text-red-700 dark:text-red-300">
                  X.0.0
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {semver.rules.major}
              </p>
              <div className="pt-2 text-[11px] text-red-600/80 dark:text-red-400/80 font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Memerlukan panduan migrasi & pemberitahuan breaking change</span>
              </div>
            </div>

            {/* MINOR */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-2 dark:border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-black text-blue-600 dark:text-blue-400">
                  MINOR (Minor)
                </span>
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                  x.Y.0
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {semver.rules.minor}
              </p>
              <div className="pt-2 text-[11px] text-blue-600/80 dark:text-blue-400/80 font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Penambahan fitur baru yang 100% kompatibel ke belakang</span>
              </div>
            </div>

            {/* PATCH */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2 dark:border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                  PATCH (Patch)
                </span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  x.y.Z
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {semver.rules.patch}
              </p>
              <div className="pt-2 text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Perbaikan bug & patch keamanan yang aman</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-Release Lifecycle Section (Alpha, Beta, RC, Stable) */}
        <section className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Pipeline Pematangan Pra-Rilis
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Software melewati 4 tahapan siklus bertahap mulai dari pengembangan awal modul hingga ketersediaan resmi produksi.
            </p>
          </div>

          {/* Workflow Diagram Banner */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/50 shadow-2xs">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-3">
              Alur Perkembangan Siklus Rilis:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stages.map((stg, i) => {
                const colorConfig = stageColorMap[stg.color] || stageColorMap.blue;
                return (
                  <div
                    key={stg.stage}
                    className={`rounded-xl border ${colorConfig.border} ${colorConfig.bg} p-3 relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-zinc-400">
                        LANGKAH {i + 1}
                      </span>
                      <span className={`rounded font-mono text-[10px] font-bold px-1.5 py-0.5 ${colorConfig.badgeBg} ${colorConfig.text}`}>
                        {stg.tag}
                      </span>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 block">
                      {stg.stage}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate mt-0.5">
                      {stg.environment}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Cards Detail */}
          <div className="grid gap-6 md:grid-cols-2">
            {stages.map((stg) => {
              const colorConfig = stageColorMap[stg.color] || stageColorMap.blue;
              return (
                <div
                  key={stg.stage}
                  className={`flex flex-col justify-between rounded-3xl border ${colorConfig.border} bg-white dark:bg-zinc-900/60 p-6 shadow-2xs space-y-5`}
                >
                  <div className="space-y-4">
                    {/* Header of Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-md ${colorConfig.badgeBg} px-2.5 py-0.5 text-xs font-bold ${colorConfig.text}`}>
                            {stg.badge}
                          </span>
                          <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            {stg.tag}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                          {stg.stage}
                        </h3>
                      </div>

                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-1 text-right">
                        <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-semibold">
                          Contoh Tag
                        </span>
                        <span className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-200">
                          {stg.example}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/50">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                          Target Audiens
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                          {stg.audience}
                        </span>
                      </div>
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/50">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                          Target Lingkungan
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                          {stg.environment}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {stg.description}
                    </p>
                  </div>

                  {/* Best Practices Checklist */}
                  <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Aturan Praktik Terbaik:</span>
                    </span>
                    <ul className="space-y-1.5">
                      {stg.bestPractices.map((bp, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Precedence and Git Tagging Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Version Precedence & Tagging (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Version Precedence */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Aturan Urutan Prioritas (Precedence) Versi
                </h3>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto shadow-inner">
                <div className="text-zinc-500 mb-2 font-sans text-[11px]">
                  # Urutan prioritas rilis dari proyek baru (0.1.0) hingga rilis produksi (1.0.0):
                </div>
                <pre className="text-emerald-400">
                  0.1.0-alpha.1 &lt; 0.1.0-beta.1 &lt; 0.1.0-rc.1 &lt; 0.1.0 &lt; 1.0.0-rc.1 &lt; 1.0.0 &lt; 1.0.1
                </pre>
              </div>
            </section>

            {/* Git Tag Commands */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-purple-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Cheatsheet Perintah Tag Rilis Git
                </h3>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto shadow-inner space-y-2">
                <p className="text-zinc-500 text-[11px]"># A. Proyek Baru (Fase Awal Pengembangan 0.y.z):</p>
                <p className="text-amber-300">git tag -a v0.1.0-alpha.1 -m &quot;Initial Alpha v0.1.0-alpha.1 (Scaffolding & modul auth)&quot;</p>
                <p className="text-blue-300">git tag -a v0.1.0-beta.1 -m &quot;Beta v0.1.0-beta.1 (Feature Freeze Sprint 1)&quot;</p>
                <p className="text-purple-300">git tag -a v0.1.0-rc.1 -m &quot;Release Candidate v0.1.0-rc.1 (Verifikasi QA Sprint 1)&quot;</p>
                <p className="text-emerald-300">git tag -a v0.1.0 -m &quot;Internal Stable Baseline v0.1.0 (Modul 1 Selesai)&quot;</p>

                <p className="text-zinc-500 text-[11px] pt-2"># B. Rilis Resmi Produksi Pertama (Ketersediaan Umum / GA):</p>
                <p className="text-purple-300">git tag -a v1.0.0-rc.1 -m &quot;Release Candidate v1.0.0-rc.1 (Pengujian Final Pre-Produksi)&quot;</p>
                <p className="text-emerald-300">git tag -a v1.0.0 -m &quot;Rilis Resmi Produksi Pertama v1.0.0 (GA)&quot;</p>

                <p className="text-zinc-500 text-[11px] pt-1"># C. Push seluruh tag ke remote repository:</p>
                <p className="text-zinc-100">git push origin --tags</p>
              </div>
            </section>
          </div>

          {/* Right Column: Governance Rules (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Tata Kelola & Best Practice Rilis
              </h3>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-2xs">
              <div className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100">Tahap Awal Pengembangan (v0.y.z):</strong> Proyek baru dimulai dari <code>v0.1.0-alpha.1</code>. Perubahan breaking changes diperbolehkan selama versi major masih nol sebelum rilis stabil <code>v1.0.0</code>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100">Tag Git Bersifat Kekal (Immutable):</strong> Tag yang sudah di-push tidak boleh dihapus atau dialihkan commit-nya. Perbaikan bug harus menaikkan nomor patch / pre-release berikutnya.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100">Otomasi Changelog & Release Notes:</strong> Integrasikan SemVer dengan format Conventional Commits (<code className="font-mono text-zinc-800 dark:text-zinc-200">feat:</code>, <code className="font-mono text-zinc-800 dark:text-zinc-200">fix:</code>) untuk otomasi rilis.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100">Metadata Build (+build.N):</strong> Metadata build (misal <code className="font-mono text-zinc-800 dark:text-zinc-200">v0.1.0+sha.a1b2c3</code>) tidak mengubah urutan prioritas rilis versi.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
