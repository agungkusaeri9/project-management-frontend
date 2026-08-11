'use client';

import { useState } from 'react';
import { Download, Loader2, FileSpreadsheet, ArrowLeft, Search, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const sampleProjectFields = [
  { row: 2, key: 'Code', value: 'PRJ-HRIS-001', required: true },
  { row: 3, key: 'Name', value: 'Human Resource Information System (HRIS Enterprise)', required: true },
  { row: 4, key: 'Status', value: 'ongoing', required: true },
  { row: 5, key: 'PIC / Project Manager', value: 'Budi Santoso', required: true },
  { row: 6, key: 'Customer', value: 'PT Nusantara Utama Tech', required: false },
  { row: 7, key: 'Start Date', value: '2026-09-01', required: true },
  { row: 8, key: 'End Date', value: '2027-03-31', required: false },
  { row: 9, key: 'Description', value: 'Pengembangan Sistem Informasi SDM Terintegrasi meliputi Kepegawaian, Presensi, Payroll, Kinerja, dan Rekrutmen.', required: false },
];

const sampleTeamProgrammers = [
  { row: 14, role: 'programmer', name: 'Budi Santoso', spec: 'fullstack' },
  { row: 15, role: 'programmer', name: 'Agung Kusaeri', spec: 'backend' },
  { row: 16, role: 'programmer', name: 'Rina Dewi', spec: 'frontend' },
  { row: 17, role: 'programmer', name: 'Diki Ramadhan', spec: 'backend' },
  { row: 18, role: 'programmer', name: 'Maya Safitri', spec: 'frontend' },
];

const sampleTeamElectrical = [
  { row: 22, role: 'electrical', name: 'Dani Wirawan', spec: '-' },
  { row: 23, role: 'electrical', name: 'Hendra Kurnia', spec: '-' },
  { row: 24, role: 'electrical', name: 'Eko Prasetyo', spec: '-' },
];

const sampleTeamSales = [
  { row: 28, role: 'sales', name: 'Sari Utami', spec: '-' },
];

const sampleHrisFeatures = [
  // Module 1: Organization Management (10)
  // Module 1: Organization Management (10)
  { id: 1, module: 'Organization Management', feature: 'Master Data Company & Cabang', sub: 'Tambah Cabang Perusahaan', status: 'Completed' },
  { id: 2, module: 'Organization Management', feature: 'Master Data Company & Cabang', sub: 'Edit & Non-aktifkan Cabang', status: 'Completed' },
  { id: 3, module: 'Organization Management', feature: 'Struktur Organisasi (Chart)', sub: 'Visualisasi Hierarchy Chart', status: 'Completed' },
  { id: 4, module: 'Organization Management', feature: 'Departemen & Divisi', sub: 'Mapping Matrix Departemen', status: 'Completed' },
  { id: 5, module: 'Organization Management', feature: 'Jabatan & Level Pekerjaan', sub: 'Setting Job Description', status: 'Completed' },
  { id: 6, module: 'Organization Management', feature: 'Grade Gaji & Banding', sub: 'Setting Range Gaji Min-Max', status: 'Completed' },
  { id: 7, module: 'Organization Management', feature: 'Lokasi Kerja & Shift Zone', sub: 'Setting Koordinat Office Radius', status: 'Completed' },
  { id: 8, module: 'Organization Management', feature: 'Cost Center Management', sub: 'Allocation Budget per Dept', status: 'In Progress' },
  { id: 9, module: 'Organization Management', feature: 'Tipe Status Karyawan', sub: 'Setting PKWT / PKWTT / Magang', status: 'In Progress' },
  { id: 10, module: 'Organization Management', feature: 'Jam Kerja & Hari Libur', sub: 'Setting Calendar Libur Nasional', status: 'In Progress' },

  // Module 2: Employee Management (10)
  { id: 11, module: 'Employee Management', feature: 'Master Data Karyawan', sub: 'Form Input Karyawan Baru', status: 'Completed' },
  { id: 12, module: 'Employee Management', feature: 'Master Data Karyawan', sub: 'Import Data Karyawan via Excel', status: 'Completed' },
  { id: 13, module: 'Employee Management', feature: 'Profil & Bio Karyawan', sub: 'Upload Foto & Dokumen Pribadi', status: 'Completed' },
  { id: 14, module: 'Employee Management', feature: 'Data Keluarga & Darurat', sub: 'Input Data Tanggungan BPJS', status: 'Completed' },
  { id: 15, module: 'Employee Management', feature: 'History Kontrak & Masa Kerja', sub: 'Reminder Kontrak Habis (30 Hari)', status: 'Completed' },
  { id: 16, module: 'Employee Management', feature: 'Shift Kerja & Rotasi', sub: 'Plotting Shift Mingguan/Bulanan', status: 'Completed' },
  { id: 17, module: 'Employee Management', feature: 'Mutasi & Rotasi Karyawan', sub: 'SK Mutasi & Change Department', status: 'In Progress' },
  { id: 18, module: 'Employee Management', feature: 'Promosi & Demosi', sub: 'Adjustment Grade & Position', status: 'In Progress' },
  { id: 19, module: 'Employee Management', feature: 'Resign & Exit Interview', sub: 'Clearance Form Offboarding', status: 'In Progress' },
  { id: 20, module: 'Employee Management', feature: 'Digital ID Card Generator', sub: 'Generate QR Code Badge', status: 'In Progress' },

  // Module 3: Time & Attendance (10)
  { id: 21, module: 'Time & Attendance', feature: 'Integrasi Mesin Fingerprint', sub: 'Auto Sync Log Presensi Realtime' },
  { id: 22, module: 'Time & Attendance', feature: 'Geo-Tagging Mobile Absensi', sub: 'Radius GPS Check-in / Check-out' },
  { id: 23, module: 'Time & Attendance', feature: 'Pengajuan Cuti Online', sub: 'Kalkulasi Sisa Jatah Cuti Tahunan' },
  { id: 24, module: 'Time & Attendance', feature: 'Pengajuan Lembur (Overtime)', sub: 'Kalkulasi Tarif Lembur Depnaker' },
  { id: 25, module: 'Time & Attendance', feature: 'Pengajuan Izin & Sakit', sub: 'Upload Surat Dokter / Bukti Izin' },
  { id: 26, module: 'Time & Attendance', feature: 'Approval Berjenjang Presensi', sub: 'Notification Approval Supervisor' },
  { id: 27, module: 'Time & Attendance', feature: 'Rekapitulasi Presensi Bulanan', sub: 'Export Summary Kehadiran' },
  { id: 28, module: 'Time & Attendance', feature: 'Kalkulasi Keterlambatan', sub: 'Denda & Potongan Absensi' },
  { id: 29, module: 'Time & Attendance', feature: 'Pengaturan Shift Malam & Sub', sub: 'Tunjangan Shift Malam' },
  { id: 30, module: 'Time & Attendance', feature: 'Koreksi Absensi (Adjustment)', sub: 'Approval Lupa Absen' },

  // Module 4: Payroll System (10)
  { id: 31, module: 'Payroll System', feature: 'Master Komponen Gaji', sub: 'Gaji Pokok, Tunjangan, Potongan' },
  { id: 32, module: 'Payroll System', feature: 'Kalkulasi PPh 21 TER', sub: 'Metode Gross, Gross-Up, Netto' },
  { id: 33, module: 'Payroll System', feature: 'BPJS Ketenagakerjaan', sub: 'JKK, JKM, JHT, JP Calculator' },
  { id: 34, module: 'Payroll System', feature: 'BPJS Kesehatan', sub: 'Perhitungan Plafon 4% Company & 1% Employee' },
  { id: 35, module: 'Payroll System', feature: 'Monthly Payroll Processing', sub: 'Bulk Calculation Gaji Bulanan' },
  { id: 36, module: 'Payroll System', feature: 'Slip Gaji Digital (PDF)', sub: 'Password Protected Slip Email/ESS' },
  { id: 37, module: 'Payroll System', feature: 'Tunjangan Hari Raya (THR)', sub: 'Kalkulasi THR Prorata / Full' },
  { id: 38, module: 'Payroll System', feature: 'Bonus & Severance Pay', sub: 'Kalkulasi Pesangon PMTK' },
  { id: 39, module: 'Payroll System', feature: 'Export Bank Transfer File', sub: 'Generate File Payroll BCA, Mandiri, BNI' },
  { id: 40, module: 'Payroll System', feature: 'Laporan Summary Payroll', sub: 'Laporan Gaji per Departemen & Cost Center' },

  // Module 5: Recruitment & Onboarding (10)
  { id: 41, module: 'Recruitment & Onboarding', feature: 'Job Requisition Request', sub: 'Pengajuan FPTK / Penambahan Headcount' },
  { id: 42, module: 'Recruitment & Onboarding', feature: 'Job Posting Portal', sub: 'Publish Lowongan ke Career Page' },
  { id: 43, module: 'Recruitment & Onboarding', feature: 'Applicant Tracking System (ATS)', sub: 'Screening CV & Parsing Profile' },
  { id: 44, module: 'Recruitment & Onboarding', feature: 'Jadwal Wawancara (Interview)', sub: 'Calendar Invite Google / Teams' },
  { id: 45, module: 'Recruitment & Onboarding', feature: 'Form Evaluasi Interviewer', sub: 'Scorecard Penilaian Kandidat' },
  { id: 46, module: 'Recruitment & Onboarding', feature: 'Job Offer Letter Generator', sub: 'E-Signature & Digital Offering' },
  { id: 47, module: 'Recruitment & Onboarding', feature: 'Onboarding Checklist', sub: 'Penyiapan Laptop, Email & Badge' },
  { id: 48, module: 'Recruitment & Onboarding', feature: 'Database Talent Pool', sub: 'Search CV & Tagging Skill' },
  { id: 49, module: 'Recruitment & Onboarding', feature: 'Analytics Rekrutmen', sub: 'Time to Hire & Cost per Hire Report' },
  { id: 50, module: 'Recruitment & Onboarding', feature: 'Integrasi Job Portal API', sub: 'Auto Post Jobstreet & LinkedIn' },

  // Module 6: Performance Appraisal (10)
  { id: 51, module: 'Performance Appraisal', feature: 'Setting Template KPI', sub: 'KPI Cascading Company to Dept' },
  { id: 52, module: 'Performance Appraisal', feature: 'Self Assessment Karyawan', sub: 'Input Pencapaian Target Goal' },
  { id: 53, module: 'Performance Appraisal', feature: 'Evaluation Atasan Langsung', sub: 'Penilaian Performance & Soft Skill' },
  { id: 54, module: 'Performance Appraisal', feature: '360 Degree Feedback', sub: 'Review Rekan Kerja (Peer Review)' },
  { id: 55, module: 'Performance Appraisal', feature: 'Rating & Calibration Committee', sub: 'Bell Curve Calibration Session' },
  { id: 56, module: 'Performance Appraisal', feature: 'Individual Development Plan (IDP)', sub: 'Rencana Pengembangan Karir' },
  { id: 57, module: 'Performance Appraisal', feature: 'Performance Improvement Plan (PIP)', sub: 'Tracking Karyawan Underperforming' },
  { id: 58, module: 'Performance Appraisal', feature: 'Laporan Penilaian Kinerja', sub: 'Matrix Sembilan Kotak (9-Box Matrix)' },
  { id: 59, module: 'Performance Appraisal', feature: 'Tracking Milestone Goal', sub: 'Progress Indicator KPI Q1-Q4' },
  { id: 60, module: 'Performance Appraisal', feature: 'Approval Final Rating', sub: 'Sign-off HR Director & BOD' },

  // Module 7: Learning & Development (10)
  { id: 61, module: 'Learning & Development', feature: 'Katalog Pelatihan & Course', sub: 'Daftar Training Internal & Eksternal' },
  { id: 62, module: 'Learning & Development', feature: 'Need Analysis (TNA)', sub: 'Survei Kebutuhan Pelatihan Dept' },
  { id: 63, module: 'Learning & Development', feature: 'Pengajuan Training Karyawan', sub: 'Approval Budget Training Atasan' },
  { id: 64, module: 'Learning & Development', feature: 'Schedule & Logistics Training', sub: 'Booking Ruangan & Material' },
  { id: 65, module: 'Learning & Development', feature: 'Absensi & Kehadiran Training', sub: 'QR Code Scan Kehadiran Peserta' },
  { id: 66, module: 'Learning & Development', feature: 'Post-Training Evaluation', sub: 'Form Feedback Pre-Test & Post-Test' },
  { id: 67, module: 'Learning & Development', feature: 'Sertifikasi & Lisensi', sub: 'Upload Sertifikat & Reminder Renewal' },
  { id: 68, module: 'Learning & Development', feature: 'Training Cost Tracking', sub: 'Realisasi Budget Training vs Target' },
  { id: 69, module: 'Learning & Development', feature: 'Matriks Kompetensi Karyawan', sub: 'Mapping Standard Competency' },
  { id: 70, module: 'Learning & Development', feature: 'Skill Gap Analysis Report', sub: 'Analisis Kekurangan Skill Tim' },

  // Module 8: Reimbursement & Medical Claim (10)
  { id: 71, module: 'Reimbursement & Medical Claim', feature: 'Master Jenis Klaim & Plafon', sub: 'Kacamata, Rawat Inap, Transport, Perjalanan Dinas' },
  { id: 72, module: 'Reimbursement & Medical Claim', feature: 'Pengajuan Reimbursement Mobile', sub: 'Upload Foto Kuitansi & Nota' },
  { id: 73, module: 'Reimbursement & Medical Claim', feature: 'Approval Berjenjang Claim', sub: 'Approval Atasan & HR Manager' },
  { id: 74, module: 'Reimbursement & Medical Claim', feature: 'Verifikasi Finance & Audit', sub: 'Pemeriksaan Keabsahan Bukti Nota' },
  { id: 75, module: 'Reimbursement & Medical Claim', feature: 'Plafon Kesehatan Karyawan', sub: 'Tracking Sisa Plafon Tahunan' },
  { id: 76, module: 'Reimbursement & Medical Claim', feature: 'Claim Restitusi Kacamata', sub: 'Verifikasi Resep Dokter & Kuitansi' },
  { id: 77, module: 'Reimbursement & Medical Claim', feature: 'Perjalanan Dinas & Official Travel', sub: 'Pengajuan Uang Muka (Settlement)' },
  { id: 78, module: 'Reimbursement & Medical Claim', feature: 'Export Bank Disbursement', sub: 'Generate Payment File Keuangan' },
  { id: 79, module: 'Reimbursement & Medical Claim', feature: 'Slip Reimbursement Digital', sub: 'Rincian Pembayaran Klaim Disetujui' },
  { id: 80, module: 'Reimbursement & Medical Claim', feature: 'Laporan Analisis Biaya Klaim', sub: 'Chart Tren Klaim Kesehatan & Dinas' },

  // Module 9: Employee Self Service (ESS) (10)
  { id: 81, module: 'Employee Self Service (ESS)', feature: 'Portal Dashboard Karyawan', sub: 'Ringkasan Sisa Cuti, Jam Masuk, & Pengumuman' },
  { id: 82, module: 'Employee Self Service (ESS)', feature: 'View & Download Slip Gaji', sub: 'Akses Slip Gaji Terenkripsi PIN' },
  { id: 83, module: 'Employee Self Service (ESS)', feature: 'Request Perubahan Data Profil', sub: 'Update Alamat, Rekening Bank, & No HP' },
  { id: 84, module: 'Employee Self Service (ESS)', feature: 'Push Notification Mobile', sub: 'Notifikasi Status Cuti & Payroll' },
  { id: 85, module: 'Employee Self Service (ESS)', feature: 'Digital Card ID & Badge', sub: 'Kartu Anggota Digital Karyawan' },
  { id: 86, module: 'Employee Self Service (ESS)', feature: 'Helpdesk & Ticketing HR', sub: 'Pengajuan Pertanyaan & Keluhan HR' },
  { id: 87, module: 'Employee Self Service (ESS)', feature: 'Request Surat Keterangan Kerja', sub: 'Auto Generate SKK untuk Bank/Visa' },
  { id: 88, module: 'Employee Self Service (ESS)', feature: 'Broadcast Pengumuman Perusahaan', sub: 'Internal News & Announcement' },
  { id: 89, module: 'Employee Self Service (ESS)', feature: 'Document Request Center', sub: 'Permohonan Copy Kontrak / Formulir' },
  { id: 90, module: 'Employee Self Service (ESS)', feature: 'Survei Kepuasan Karyawan', sub: 'e-NPS Employee Net Promoter Score' },

  // Module 10: Analytics & HR Reporting (10)
  { id: 91, module: 'Analytics & HR Reporting', feature: 'Dashboard Executive HR', sub: 'Metric Total Headcount, Turnover, & Cost' },
  { id: 92, module: 'Analytics & HR Reporting', feature: 'Laporan Turnover Karyawan', sub: 'Analisis Rate In/Out & Exit Reason' },
  { id: 93, module: 'Analytics & HR Reporting', feature: 'Laporan Demografi Karyawan', sub: 'Breakdown Usia, Gender, & Masa Kerja' },
  { id: 94, module: 'Analytics & HR Reporting', feature: 'Laporan Headcount & Budgeting', sub: 'Manpower Planning vs Actual' },
  { id: 95, module: 'Analytics & HR Reporting', feature: 'Attendance & Late Rate Report', sub: 'Grafik Persentase Kehadiran Dept' },
  { id: 96, module: 'Analytics & HR Reporting', feature: 'Laporan BPJS & PPh 21 Masa', sub: 'Data Rekapitulasi Pajak & Jamsostek' },
  { id: 97, module: 'Analytics & HR Reporting', feature: 'Audit Log Activity System', sub: 'Tracking History Perubahan Data Sensitive' },
  { id: 98, module: 'Analytics & HR Reporting', feature: 'Role Access & Permission', sub: 'Setting Hak Akses User Admin / User' },
  { id: 99, module: 'Analytics & HR Reporting', feature: 'Backup & Restore Database', sub: 'Schedule Automatic Backup System' },
  { id: 100, module: 'Analytics & HR Reporting', feature: 'Export Reports Multi-Format', sub: 'Export Laporan HR ke Excel, CSV & PDF' },
];

type SheetName = 'project' | 'modules';

export default function SampleHRISTemplatePage() {
  const [activeSheet, setActiveSheet] = useState<SheetName>('project');
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownload = async () => {
    setIsDownloading(true);
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
      setIsDownloading(false);
    }
  };

  const filteredFeatures = sampleHrisFeatures.filter(
    (item) =>
      item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6 pb-16">

        {/* Back Link */}
        <div>
          <Link
            href="/template/import-project"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Template Impor Kosong
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 p-6 rounded-2xl text-white shadow-lg">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium border border-indigo-400/30">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Sample Case Study HRIS Enterprise
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Contoh File Impor Project Lengkap</h1>
            <p className="text-xs md:text-sm text-indigo-200">
              Berisi 1 Project, 9 Anggota Tim, <span className="font-bold text-amber-300">10 Modul</span> & <span className="font-bold text-amber-300">100 Fitur</span> terstruktur siap impor.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-md transition-all text-sm flex-shrink-0"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'Downloading...' : 'Download Sample HRIS (.xlsx)'}
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Total Project</div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">1 Project</div>
            <div className="text-[10px] text-slate-400">PRJ-HRIS-001</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Anggota Tim</div>
            <div className="text-lg font-bold text-indigo-600 mt-0.5">9 Personel</div>
            <div className="text-[10px] text-slate-400">5 Prog, 3 Elec, 1 Sales</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Total Module</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">10 Module</div>
            <div className="text-[10px] text-slate-400">Master to Analytics</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Total Feature & Sub</div>
            <div className="text-lg font-bold text-amber-600 mt-0.5">100 Feature</div>
            <div className="text-[10px] text-slate-400">Fully Mapped</div>
          </div>
        </div>

        {/* Workbook Preview */}
        <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-slate-200 border-b border-slate-300 px-4 pt-2 flex items-center justify-between text-xs select-none">
            <div className="flex items-end gap-1">
              {[
                { key: 'project', label: 'Sheet 1: Project & Tim (9 Personel)' },
                { key: 'modules', label: 'Sheet 2: Modul & Fitur (100 Fitur)' },
              ].map((sheet) => (
                <button
                  key={sheet.key}
                  onClick={() => setActiveSheet(sheet.key as SheetName)}
                  className={`px-4 py-2 rounded-t-md border border-b-0 font-semibold transition-colors ${
                    activeSheet === sheet.key
                      ? 'bg-white border-slate-300 text-slate-800 -mb-px shadow-sm'
                      : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {sheet.label}
                </button>
              ))}
            </div>

            {activeSheet === 'modules' && (
              <div className="relative mb-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari module / feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {/* SHEET 1: PROJECT & TIM */}
            {activeSheet === 'project' && (
              <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300">
                    <th className="w-8 border border-slate-300 text-slate-400 text-center py-1 font-normal"></th>
                    <th className="w-44 border border-slate-300 text-slate-500 text-center py-1 font-semibold">A</th>
                    <th className="border border-slate-300 text-slate-500 text-center py-1 font-semibold">B</th>
                    <th className="w-56 border border-slate-300 text-slate-500 text-center py-1 font-semibold">C</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Section A */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">1</td>
                    <td colSpan={3} className="border border-slate-300 bg-indigo-700 text-white font-bold px-3 py-2 tracking-widest text-[11px] uppercase">
                      ▶ A. Informasi Project
                    </td>
                  </tr>

                  {sampleProjectFields.map(({ row, key, value, required }) => (
                    <tr key={row} className="hover:bg-slate-50">
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{row}</td>
                      <td className={`border border-slate-300 px-3 py-1.5 font-bold ${required ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
                        {key} {required && <span className="text-red-500">*</span>}
                      </td>
                      <td colSpan={2} className="border border-slate-300 px-3 py-1.5 bg-emerald-50 text-emerald-900 font-medium">
                        {value}
                      </td>
                    </tr>
                  ))}

                  {/* Spacer */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">10</td>
                    <td colSpan={3} className="border border-slate-300 bg-white py-1"></td>
                  </tr>

                  {/* Section B */}
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
                  {sampleTeamProgrammers.map((m) => (
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
                  {sampleTeamElectrical.map((m) => (
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
                  {sampleTeamSales.map((m) => (
                    <tr key={m.row}>
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{m.row}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-medium bg-cyan-50 text-cyan-800">{m.role}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-medium">{m.name}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">{m.spec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* SHEET 2: MODUL & FITUR (100 FITUR) */}
            {activeSheet === 'modules' && (
              <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300">
                    <th className="w-12 border border-slate-300 text-slate-500 text-center py-1 font-semibold">Row</th>
                    <th className="w-56 border border-slate-300 text-slate-700 text-left px-3 py-1.5 font-bold">Nama Module *</th>
                    <th className="w-64 border border-slate-300 text-slate-700 text-left px-3 py-1.5 font-bold">Nama Feature *</th>
                    <th className="border border-slate-300 text-slate-700 text-left px-3 py-1.5 font-bold">Nama Sub Feature</th>
                    <th className="w-36 border border-slate-300 text-slate-700 text-center px-3 py-1.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeatures.map((item, idx) => {
                    const statusVal = (item as any).status || 'Planning';
                    let badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
                    if (statusVal === 'Completed') badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    if (statusVal === 'In Progress') badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
                    if (statusVal === 'Pending') badgeBg = 'bg-purple-100 text-purple-800 border-purple-300';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="bg-slate-100 border border-slate-300 text-slate-500 text-center py-1 text-[10px]">{idx + 3}</td>
                        <td className="border border-slate-300 px-3 py-1.5 font-semibold text-indigo-700 bg-indigo-50/50">{item.module}</td>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-800">{item.feature}</td>
                        <td className="border border-slate-300 px-3 py-1.5 text-slate-600">{item.sub}</td>
                        <td className="border border-slate-300 px-3 py-1.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                            {statusVal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFeatures.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 italic">
                        Tidak ada fitur yang cocok dengan pencarian "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
