'use client';

import { useState } from 'react';
import { Download, Loader2, Sparkles, FileSpreadsheet, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const featureRows = [
  ['Master Data', 'Manajemen Material', 'Tambah Material'],
  ['', 'Manajemen Material', 'Edit Material'],
  ['', 'Manajemen Material', 'Hapus Material'],
  ['', 'Manajemen Supplier', 'Tambah Supplier'],
  ['', 'Manajemen Supplier', ''],
  ['Produksi', 'Work Order', 'Buat WO'],
  ['', 'Work Order', 'Approve WO'],
  ['', 'Monitoring Produksi', ''],
  ['Laporan', 'Laporan Harian', ''],
  ['', 'Laporan Bulanan', ''],
  ['Dashboard', 'Ringkasan Data', ''],
  ['', 'Grafik Produksi', 'Filter Bulanan'],
  ['', 'Grafik Produksi', 'Export PDF'],
];

const memberRows = [
  { role: 'programmer', name: 'Budi Santoso', specialization: 'fullstack', is_pic: 'YES' },
  { role: 'programmer', name: 'Agung Kusaeri', specialization: 'backend', is_pic: 'NO' },
  { role: 'programmer', name: 'Rina Dewi', specialization: 'frontend', is_pic: 'NO' },
  { role: 'electrical', name: 'Dani Wirawan', specialization: '-', is_pic: 'YES' },
  { role: 'sales', name: 'Sari Utami', specialization: '-', is_pic: 'YES' },
];

const roleBg: Record<string, string> = {
  programmer: 'bg-violet-50 text-violet-800',
  electrical: 'bg-orange-50 text-orange-800',
  sales: 'bg-cyan-50 text-cyan-800',
};

type SheetName = 'project' | 'modules';

export default function ImportProjectTemplatePage() {
  const [activeSheet, setActiveSheet] = useState<SheetName>('project');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const res = await fetch(`${apiUrl}/api/templates/import-project`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import-project-template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal download template. Pastikan backend aktif.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSample = async () => {
    setIsDownloadingSample(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const res = await fetch(`${apiUrl}/api/templates/sample-hris`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import-project-sample-hris.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal download sample HRIS. Pastikan backend aktif.');
    } finally {
      setIsDownloadingSample(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Import Project — Template Excel</h1>
            <p className="text-sm text-slate-500 mt-0.5">1 file = 1 project. Ikuti format di bawah untuk mengisi file Excel.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-semibold shadow-sm transition-all text-sm flex-shrink-0"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? 'Downloading...' : 'Template Kosong (.xlsx)'}
            </button>
            <button
              onClick={handleDownloadSample}
              disabled={isDownloadingSample}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold shadow-sm transition-all text-sm flex-shrink-0"
            >
              {isDownloadingSample ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              {isDownloadingSample ? 'Downloading...' : 'Sample HRIS (.xlsx)'}
            </button>
          </div>
        </div>

        {/* Banner Link to Sample HRIS View */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm">Butuh Contoh Isian Project Lengkap?</div>
              <p className="text-xs text-slate-500">Lihat studi kasus **HRIS Enterprise** berisi 1 Project, 9 Tim, 10 Modul, & 100 Fitur.</p>
            </div>
          </div>
          <Link
            href="/template/sample-hris"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold rounded-lg text-xs transition-colors flex-shrink-0 shadow-sm"
          >
            Lihat Sample <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ═══ WORKBOOK ═══ */}
        <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">

          {/* Sheet Tabs */}
          <div className="bg-slate-200 border-b border-slate-300 px-4 pt-2 flex items-end gap-1 text-xs select-none">
            {[
              { key: 'project', label: 'Project & Tim' },
              { key: 'modules', label: 'Modul & Fitur' },
            ].map((sheet) => (
              <button
                key={sheet.key}
                onClick={() => setActiveSheet(sheet.key as SheetName)}
                className={`px-4 py-1.5 rounded-t-md border border-b-0 font-semibold transition-colors ${
                  activeSheet === sheet.key
                    ? 'bg-white border-slate-300 text-slate-800 -mb-px'
                    : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {sheet.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">

            {/* ═══════════════════════════════════════ */}
            {/* SHEET 1: Project Info + Team Members   */}
            {/* ═══════════════════════════════════════ */}
            {activeSheet === 'project' && (
              <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300">
                    <th className="w-8 border border-slate-300 text-slate-400 text-center py-1 font-normal"></th>
                    <th className="w-40 border border-slate-300 text-slate-500 text-center py-1 font-semibold">A</th>
                    <th className="border border-slate-300 text-slate-500 text-center py-1 font-semibold">B</th>
                    <th className="w-56 border border-slate-300 text-slate-500 text-center py-1 font-semibold">C</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ── Section: Project Info ── */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">1</td>
                    <td colSpan={3} className="border border-slate-300 bg-indigo-700 text-white font-bold px-3 py-2 tracking-widest text-[11px] uppercase">
                      ▶ A. Informasi Project
                    </td>
                  </tr>

                  {[
                    { row: 2,  key: 'Code',                  value: 'PRJ-001',                                    note: 'Kode unik project',                 required: true },
                    { row: 3,  key: 'Name',                  value: 'Sistem ERP Manufacturing',                   note: 'Nama lengkap project',               required: true },
                    { row: 4,  key: 'Status',                value: 'ongoing',                                    note: 'new | ongoing | internal-testing | on-hold | completed', required: true },
                    { row: 5,  key: 'PIC / Project Manager', value: 'Budi Santoso (Pilih dari daftar anggota)',   note: 'Pilihan seluruh anggota terdaftar',  required: true },
                    { row: 6,  key: 'Customer',              value: 'PT Sumi Rubber Indonesia',                   note: 'Nama customer / klien',              required: false },
                    { row: 7,  key: 'Start Date',            value: '2025-01-15',                                 note: 'Format: YYYY-MM-DD',                 required: true },
                    { row: 8,  key: 'End Date',              value: '2025-12-31',                                 note: 'Format: YYYY-MM-DD',                 required: false },
                    { row: 9,  key: 'Description',           value: 'Pengembangan sistem ERP untuk lini produksi',note: 'Deskripsi singkat',                  required: false },
                  ].map(({ row, key, value, note, required }) => (
                    <tr key={row} className="hover:bg-slate-50">
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{row}</td>
                      <td className={`border border-slate-300 px-3 py-2 font-bold ${required ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
                        {key} {required && <span className="text-red-500">*</span>}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 bg-emerald-50 text-emerald-800 font-medium">{value}</td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-400 italic">{note}</td>
                    </tr>
                  ))}

                  {/* Spacer */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">10</td>
                    <td colSpan={3} className="border border-slate-300 bg-white py-1"></td>
                  </tr>

                  {/* ── Section: Team Members ── */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">11</td>
                    <td colSpan={3} className="border border-slate-300 bg-indigo-700 text-white font-bold px-3 py-2 tracking-widest text-[11px] uppercase">
                      ▶ B. Anggota Tim
                    </td>
                  </tr>

                  {/* Sub-Table 1: Programmer */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">12</td>
                    <td colSpan={3} className="border border-slate-300 bg-slate-100 text-indigo-700 font-bold px-3 py-1 text-[11px]">
                      1. Programmer (Maksimal 5 Baris)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">13</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-amber-600 text-white font-bold text-center">Role Type</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-amber-600 text-white font-bold text-center">Nama Anggota *</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-slate-600 text-white font-bold text-center">Spesialisasi</td>
                  </tr>
                  {[
                    { row: 14, role: 'programmer', name: 'Budi Santoso', spec: 'fullstack' },
                    { row: 15, role: 'programmer', name: 'Agung Kusaeri', spec: 'backend' },
                    { row: 16, role: 'programmer', name: 'Rina Dewi', spec: 'frontend' },
                    { row: 17, role: 'programmer', name: '', spec: '' },
                    { row: 18, role: 'programmer', name: '', spec: '' },
                  ].map((m) => (
                    <tr key={m.row}>
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{m.row}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-medium bg-violet-50 text-violet-800">{m.role}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-medium">{m.name}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">{m.spec}</td>
                    </tr>
                  ))}

                  {/* Sub-Table 2: Electrical */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">20</td>
                    <td colSpan={3} className="border border-slate-300 bg-slate-100 text-indigo-700 font-bold px-3 py-1 text-[11px]">
                      2. Electrical (Maksimal 3 Baris)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">21</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-amber-600 text-white font-bold text-center">Role Type</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-amber-600 text-white font-bold text-center">Nama Anggota *</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-slate-600 text-white font-bold text-center">Spesialisasi</td>
                  </tr>
                  {[
                    { row: 22, role: 'electrical', name: 'Dani Wirawan', spec: '-' },
                    { row: 23, role: 'electrical', name: '', spec: '' },
                    { row: 24, role: 'electrical', name: '', spec: '' },
                  ].map((m) => (
                    <tr key={m.row}>
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{m.row}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-medium bg-orange-50 text-orange-800">{m.role}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-medium">{m.name}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">{m.spec}</td>
                    </tr>
                  ))}

                  {/* Sub-Table 3: Sales */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">26</td>
                    <td colSpan={3} className="border border-slate-300 bg-slate-100 text-indigo-700 font-bold px-3 py-1 text-[11px]">
                      3. Sales (Maksimal 1 Baris)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">27</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-amber-600 text-white font-bold text-center">Role Type</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-amber-600 text-white font-bold text-center">Nama Anggota *</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-slate-600 text-white font-bold text-center">Spesialisasi</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">28</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center font-medium bg-cyan-50 text-cyan-800">sales</td>
                    <td className="border border-slate-300 px-3 py-1.5 font-medium">Sari Utami</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">-</td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* ═══════════════════════════════════════ */}
            {/* SHEET 2: Modules & Features            */}
            {/* ═══════════════════════════════════════ */}
            {activeSheet === 'modules' && (
              <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300">
                    <th className="w-8 border border-slate-300 text-slate-400 text-center py-1 font-normal"></th>
                    <th className="w-48 border border-slate-300 text-slate-500 text-center py-1 font-semibold">A</th>
                    <th className="w-48 border border-slate-300 text-slate-500 text-center py-1 font-semibold">B</th>
                    <th className="w-48 border border-slate-300 text-slate-500 text-center py-1 font-semibold">C</th>
                    <th className="w-36 border border-slate-300 text-slate-500 text-center py-1 font-semibold">D</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Section header */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">1</td>
                    <td colSpan={4} className="border border-slate-300 bg-indigo-700 text-white font-bold px-3 py-2 tracking-widest text-[11px] uppercase">
                      ▶ C. Modul, Fitur & Sub Fitur
                    </td>
                  </tr>

                  {/* Column headers */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">2</td>
                    <td className="border border-slate-300 px-3 py-2 bg-violet-700 text-white font-bold text-center">
                      Nama Module *
                      <div className="font-normal text-[10px] text-violet-200">Kelompok besar fitur</div>
                    </td>
                    <td className="border border-slate-300 px-3 py-2 bg-indigo-600 text-white font-bold text-center">
                      Nama Feature *
                      <div className="font-normal text-[10px] text-indigo-200">Fitur dalam module</div>
                    </td>
                    <td className="border border-slate-300 px-3 py-2 bg-sky-600 text-white font-bold text-center">
                      Nama Sub Feature
                      <div className="font-normal text-[10px] text-sky-200">Kosongkan jika tidak ada</div>
                    </td>
                    <td className="border border-slate-300 px-3 py-2 bg-emerald-700 text-white font-bold text-center">
                      Status
                      <div className="font-normal text-[10px] text-emerald-200">Dropdown pilihan</div>
                    </td>
                  </tr>

                  {/* Guide row */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">3</td>
                    <td className="border border-slate-300 px-3 py-2 bg-amber-50 text-amber-600 italic">Nama Module</td>
                    <td className="border border-slate-300 px-3 py-2 bg-amber-50 text-amber-600 italic">Nama Feature</td>
                    <td className="border border-slate-300 px-3 py-2 bg-sky-50 text-sky-600 italic">Sub Feature (atau kosong)</td>
                    <td className="border border-slate-300 px-3 py-2 bg-emerald-50 text-emerald-700 text-center font-medium">Planning</td>
                  </tr>

                  {/* Feature data rows */}
                  {featureRows.map((row, i) => {
                    const isNewModule = row[0] !== '';
                    const isNewFeature = row[1] !== featureRows[i - 1]?.[1] || isNewModule;
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{4 + i}</td>
                        <td className={`border border-slate-300 px-3 py-2 ${isNewModule ? 'bg-violet-100 text-violet-800 font-bold' : 'bg-white text-slate-300 italic text-[10px] text-center'}`}>
                          {isNewModule ? row[0] : '(sama)'}
                        </td>
                        <td className={`border border-slate-300 px-3 py-2 ${isNewFeature ? 'bg-indigo-50 text-indigo-800' : 'bg-white text-slate-300 italic text-[10px] text-center'}`}>
                          {isNewFeature ? row[1] : '(sama)'}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 bg-sky-50 text-sky-700">
                          {row[2] || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center bg-white text-slate-600 font-medium">
                          Planning
                        </td>
                      </tr>
                    );
                  })}

                  {/* Extra empty rows to suggest continuation */}
                  {[...Array(5)].map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{4 + featureRows.length + i}</td>
                      <td className="border border-slate-300 px-3 py-1 bg-white h-7"></td>
                      <td className="border border-slate-300 px-3 py-1 bg-white"></td>
                      <td className="border border-slate-300 px-3 py-1 bg-white"></td>
                      <td className="border border-slate-300 px-3 py-1 bg-white text-center text-slate-400">Planning</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>

        {/* Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
          <h3 className="font-bold text-amber-800 text-sm">⚠ Catatan Penting</h3>
          <ul className="space-y-1 text-xs text-amber-700 list-disc list-inside leading-relaxed">
            <li>1 file Excel = 1 project. Sheet <strong>"Project & Tim"</strong> berisi info project dan anggota tim.</li>
            <li>Sheet <strong>"Modul & Fitur"</strong> berisi daftar modul, fitur, dan sub fitur — tambahkan sebanyak yang diperlukan.</li>
            <li>Format tanggal: <code className="bg-amber-100 px-1 rounded font-mono">YYYY-MM-DD</code></li>
            <li>Status: <code className="bg-amber-100 px-1 rounded font-mono">new</code> | <code className="bg-amber-100 px-1 rounded font-mono">ongoing</code> | <code className="bg-amber-100 px-1 rounded font-mono">internal-testing</code> | <code className="bg-amber-100 px-1 rounded font-mono">on-hold</code> | <code className="bg-amber-100 px-1 rounded font-mono">completed</code></li>
            <li>Minimal <strong>1 baris sales</strong> wajib ada di bagian Anggota Tim.</li>
            <li>Kolom Nama Module boleh dikosongkan (tulis kosong) jika sama dengan baris di atasnya.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
