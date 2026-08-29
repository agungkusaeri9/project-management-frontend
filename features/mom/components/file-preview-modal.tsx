'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  FileImage,
  FileArchive,
  File as FileIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MoMFile } from '../services/mom.service';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: MoMFile[];
  initialIndex?: number;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function FilePreviewModal({
  isOpen,
  onClose,
  files,
  initialIndex = 0,
}: FilePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(100);
    setRotation(0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && files.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % files.length);
        setZoom(100);
        setRotation(0);
      }
      if (e.key === 'ArrowLeft' && files.length > 1) {
        setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
        setZoom(100);
        setRotation(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, files.length, onClose]);

  if (!isOpen || files.length === 0) return null;

  const currentFile = files[currentIndex];
  if (!currentFile) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
  const fileUrl = currentFile.file_path.startsWith('http')
    ? currentFile.file_path
    : `${baseUrl}${currentFile.file_path.startsWith('/') ? '' : '/'}${currentFile.file_path}`;

  const fileName = currentFile.file_name.toLowerCase();
  const fileType = (currentFile.file_type || '').toLowerCase();
  const isImage =
    fileType.includes('image') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.gif') ||
    fileName.endsWith('.webp') ||
    fileName.endsWith('.svg');
  const isPdf = fileType.includes('pdf') || fileName.endsWith('.pdf');

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
    setZoom(100);
    setRotation(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    setZoom(100);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950/95 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Modal Container (100% Fullscreen) */}
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950">
        
        {/* Header Bar (Clean, bright, high contrast) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
              {isImage ? (
                <FileImage className="w-5 h-5" />
              ) : isPdf ? (
                <FileText className="w-5 h-5 text-red-500" />
              ) : (
                <FileIcon className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-md sm:max-w-xl">
                  {currentFile.file_name}
                </h3>
                {files.length > 1 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                    {currentIndex + 1} dari {files.length}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBytes(currentFile.file_size)}</span>
                <span className="mx-1.5 opacity-50">•</span>
                <span className="capitalize">{isImage ? 'Gambar / Foto' : isPdf ? 'Dokumen PDF' : 'File Dokumen'}</span>
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {isImage && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mr-2 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(30, prev - 20))}
                  className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-2xs"
                  title="Perkecil (Zoom Out)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-slate-800 dark:text-slate-100 min-w-[48px] text-center">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(300, prev + 20))}
                  className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-2xs"
                  title="Perbesar (Zoom In)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-2xs"
                  title="Putar 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(100);
                    setRotation(0);
                  }}
                  className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-2xs"
                  title="Reset Ukuran"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-200 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              title="Buka di Tab Baru"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Tab Baru</span>
            </a>

            <a
              href={fileUrl}
              download={currentFile.file_name}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Download</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/40 dark:text-slate-300 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors ml-1 shadow-2xs"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="relative flex-1 bg-slate-950/90 overflow-hidden flex items-center justify-center select-none">
          {/* Navigation Arrows for Multiple Attachments */}
          {files.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 z-20 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 shadow-xl transition-transform hover:scale-105 active:scale-95"
                title="File Sebelumnya (Panah Kiri)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 z-20 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 shadow-xl transition-transform hover:scale-105 active:scale-95"
                title="File Selanjutnya (Panah Kanan)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* PDF Viewer */}
          {isPdf ? (
            <div className="w-full h-full bg-slate-900">
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=1`}
                className="w-full h-full border-0"
                title={currentFile.file_name}
              />
            </div>
          ) : isImage ? (
            /* Image Viewer with Zoom & Pan */
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img
                src={fileUrl}
                alt={currentFile.file_name}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto"
              />
            </div>
          ) : (
            /* Other File Format View */
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300 max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 mb-4 border border-slate-700 shadow-xl">
                <FileArchive className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">{currentFile.file_name}</h4>
              <p className="text-xs text-slate-400 mb-6">
                Format file ini tidak mendukung preview langsung. Anda dapat mengunduh atau membukanya di browser.
              </p>
              <div className="flex gap-3">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka di Tab Baru
                </a>
                <a
                  href={fileUrl}
                  download={currentFile.file_name}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status / Gallery Bar (Clean, bright, high contrast) */}
        {files.length > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto shrink-0 z-30 shadow-xs">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider shrink-0 mr-2">
              Lampiran ({files.length}):
            </span>
            {files.map((f, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={f.id || idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoom(100);
                    setRotation(0);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate max-w-[150px]">{f.file_name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
