'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet, Download, Eye, Sparkles, ShoppingBag, Activity,
  Loader2, CheckCircle2, FileText, ArrowUpRight
} from 'lucide-react';

export default function TemplatesPage() {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const handleDownload = async (key: string, urlPath: string, filename: string) => {
    setDownloadingKey(key);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const res = await fetch(`${apiUrl}${urlPath}`);
      if (!res.ok) throw new Error('Gagal mengunduh file template');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Gagal download template.');
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            Templates Gallery
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Kumpulan template Excel dan sampel studi kasus project untuk mempercepat impor dan standarisasi data.
          </p>
        </div>
      </div>

      {/* Section 1: Project Excel Templates (Judul/Title Kelompok) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Project Excel Templates
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Template Excel standar untuk impor otomatis Informasi Project, Tim, Modul & Fitur.
            </p>
          </div>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1: Template Kosong */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Kosongan
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Template Kosong Project
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  Template standar tanpa data dengan formulir Informasi Project, 3 sub-tabel Anggota Tim (Programmer, Electrical, Sales), serta Modul & Fitur.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => handleDownload('empty', '/api/templates/import-project', 'import-project-template.xlsx')}
                disabled={downloadingKey === 'empty'}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {downloadingKey === 'empty' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloadingKey === 'empty' ? 'Downloading...' : 'Download (.xlsx)'}
              </button>

              <Link
                href="/template/import-project"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Web Preview
              </Link>
            </div>
          </div>

          {/* Card 2: Sample HRIS Enterprise */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                  Sample HRIS
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Sample HRIS Enterprise
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  Contoh studi kasus lengkap aplikasi HRIS dengan 9 Personel Tim, 10 Modul (Payroll, Presensi, Rekrutmen), dan 100 Fitur terstruktur.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => handleDownload('hris', '/api/templates/sample-hris', 'import-project-sample-hris.xlsx')}
                disabled={downloadingKey === 'hris'}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {downloadingKey === 'hris' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloadingKey === 'hris' ? 'Downloading...' : 'Download (.xlsx)'}
              </button>

              <Link
                href="/template/sample-hris"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Web Preview (100 Fitur)
              </Link>
            </div>
          </div>

          {/* Card 3: Sample Traceability System */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Traceability
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Sample Traceability System
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  Sistem Lacak & Telusur Manufaktur lengkap: GTIN Serial Generator, QR Code Scanning, Interlock Line, IPQC Gate & Batch Recall.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => handleDownload('traceability', '/api/templates/sample-traceability', 'import-project-sample-traceability.xlsx')}
                disabled={downloadingKey === 'traceability'}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {downloadingKey === 'traceability' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {downloadingKey === 'traceability' ? 'Downloading...' : 'Download (.xlsx)'}
              </button>

              <Link
                href="/template/sample-traceability"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                Web Preview (100 Fitur)
              </Link>
            </div>
          </div>

          {/* Card 4: Placeholder SIMRS Hospital */}
          <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm opacity-75 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Segera Hadir
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                  Sample SIMRS & Healthcare
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                  Studi kasus Sistem Informasi Management Rumah Sakit dengan pendaftaran rawat jalan/inap, rekam medis digital, dan modul apotek.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-200/60 dark:border-slate-800">
              <button
                disabled
                className="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-semibold cursor-not-allowed text-center"
              >
                Segera Hadir
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
