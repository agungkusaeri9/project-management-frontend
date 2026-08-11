'use client';

import { useState, useRef } from 'react';
import { FileSpreadsheet, Download, Upload, X, Loader2, CheckCircle2, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ImportResultData {
  project_id: string;
  project_code: string;
  project_name: string;
  total_members: number;
  total_modules: number;
  total_features: number;
  total_sub_features: number;
}

export function ImportProjectModal({ isOpen, onClose, onSuccess }: ImportProjectModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingEmpty, setIsDownloadingEmpty] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ImportResultData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
      setResultData(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setErrorMessage(null);
        setResultData(null);
      } else {
        setErrorMessage('File harus berformat Excel (.xlsx atau .xls)');
      }
    }
  };

  const handleDownloadEmpty = async () => {
    setIsDownloadingEmpty(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const res = await fetch(`${apiUrl}/api/templates/import-project`);
      if (!res.ok) throw new Error('Gagal mengunduh template');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import-project-template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Gagal download template.');
    } finally {
      setIsDownloadingEmpty(false);
    }
  };

  const handleDownloadSample = async () => {
    setIsDownloadingSample(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const res = await fetch(`${apiUrl}/api/templates/sample-hris`);
      if (!res.ok) throw new Error('Gagal mengunduh sample HRIS');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import-project-sample-hris.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Gagal download sample HRIS.');
    } finally {
      setIsDownloadingSample(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Pilih file Excel terlebih dahulu');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setResultData(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`${apiUrl}/projects/import`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Gagal mengimpor file Excel');
      }

      setResultData(data.data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengunggah file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setResultData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Import Project via Excel</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Buat project, tim, modul & fitur otomatis dari file Excel</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">

          {/* Download Template Link (Plain Text) */}
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2 px-1">
            <span>Belum punya format Excel?</span>
            <button
              type="button"
              onClick={handleDownloadEmpty}
              disabled={isDownloadingEmpty}
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 underline underline-offset-2 disabled:opacity-50 inline-flex items-center gap-1 transition-colors"
            >
              {isDownloadingEmpty ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              {isDownloadingEmpty ? 'Downloading...' : 'Download Template Kosong (.xlsx)'}
            </button>
          </div>

          {/* Upload Dropzone */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-sm">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-xs">{selectedFile.name}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {(selectedFile.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">Klik untuk memilih file</span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm"> atau drag and drop di sini</span>
                  </div>
                  <p className="text-xs text-slate-400">Format yang didukung: Excel (.xlsx / .xls)</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Result Summary */}
            {resultData && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Berhasil Mengimpor Project!
                </div>
                <div className="text-xs space-y-1 pl-7">
                  <div>• <span className="font-bold">Project:</span> {resultData.project_code} — {resultData.project_name}</div>
                  <div>• <span className="font-bold">Tim:</span> {resultData.total_members} Personel disinkronisasi</div>
                  <div>• <span className="font-bold">Struktur:</span> {resultData.total_modules} Modul, {resultData.total_features} Fitur, & {resultData.total_sub_features} Sub Fitur</div>
                </div>
              </div>
            )}

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-xs transition-colors"
              >
                {resultData ? 'Tutup' : 'Batal'}
              </button>
              {!resultData && (
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm text-xs transition-all"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Memproses Impor...' : 'Proses Import Project'}
                </button>
              )}
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
