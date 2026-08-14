'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  FolderArchive,
  Upload,
  Download,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit2,
  Eye,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileImage,
  File,
  X,
  Check,
  Plus,
  Calendar,
  User,
  HardDrive,
  Layers,
  LayoutGrid,
  List,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { fileService, FileStorageItem, FileStats } from '@/features/file-management/services/file.service';
import { useAuthStore } from '@/store/auth.store';

// Helper function to return file icon & color based on extension / mime
function getFileIcon(ext?: string | null, mime?: string | null) {
  const e = (ext || '').toLowerCase();
  const m = (mime || '').toLowerCase();

  if (e === '.pdf' || m.includes('pdf')) {
    return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/60', border: 'border-red-200 dark:border-red-900/50' };
  }
  if (['.xlsx', '.xls', '.csv'].includes(e) || m.includes('spreadsheet') || m.includes('excel')) {
    return { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/60', border: 'border-emerald-200 dark:border-emerald-900/50' };
  }
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(e) || m.includes('image')) {
    return { icon: FileImage, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/60', border: 'border-blue-200 dark:border-blue-900/50' };
  }
  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(e) || m.includes('zip') || m.includes('compressed')) {
    return { icon: FileArchive, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-200 dark:border-amber-900/50' };
  }
  if (['.go', '.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.sql', '.py'].includes(e)) {
    return { icon: FileCode, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/60', border: 'border-violet-200 dark:border-violet-900/50' };
  }
  return { icon: File, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' };
}

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const DEFAULT_CATEGORY_PRESETS = [
  'Dokumen Teknis',
  'SOP & Panduan',
  'Design & Asset',
  'Meeting & MOM',
  'Laporan & Evaluasi',
  'Contract & Legal',
  'Template & Format',
  'Umum',
];

export default function FileManagementPage() {
  const { user } = useAuthStore();
  
  // Data states
  const [files, setFiles] = useState<FileStorageItem[]>([]);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploadDisplayName, setUploadDisplayName] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('Dokumen Teknis');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDraggingInsideModal, setIsDraggingInsideModal] = useState<boolean>(false);
  const [isDraggingPage, setIsDraggingPage] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [fileToEdit, setFileToEdit] = useState<FileStorageItem | null>(null);
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Delete Modal State
  const [fileToDelete, setFileToDelete] = useState<FileStorageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Global Page Drag & Drop Listener
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDraggingPage(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        setIsDraggingPage(false);
        dragCounter.current = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingPage(false);
      dragCounter.current = 0;

      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        const file = droppedFiles[0];
        handleFileSelect(file);
        setIsUploadOpen(true);
        toast.info(`File "${file.name}" siap diunggah.`);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Load files, categories, and stats
  const fetchAllData = async (showToast: boolean = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      else setIsLoading(true);

      const [filesRes, catsRes, statsRes] = await Promise.all([
        fileService.getFiles({
          q: searchQuery.trim() || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          page,
          limit,
        }),
        fileService.getCategories(),
        fileService.getStats(),
      ]);

      setFiles(filesRes.data || []);
      setTotalFiles(filesRes.total || 0);
      setCategories(catsRes || []);
      setStats(statsRes || null);

      if (showToast) {
        toast.success('Data file management berhasil diperbarui!');
      }
    } catch (err: any) {
      console.error('Failed to load files:', err);
      toast.error(err.response?.data?.error || err.message || 'Gagal memuat file storage');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [page, limit, selectedCategory]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchAllData();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Client-side file type filter
  const filteredFiles = useMemo(() => {
    if (selectedFileType === 'all') return files;
    return files.filter((f) => {
      const ext = (f.extension || '').toLowerCase();
      if (selectedFileType === 'pdf') return ext === '.pdf';
      if (selectedFileType === 'image') return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext);
      if (selectedFileType === 'excel') return ['.xlsx', '.xls', '.csv'].includes(ext);
      if (selectedFileType === 'archive') return ['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext);
      if (selectedFileType === 'code') return ['.go', '.ts', '.tsx', '.js', '.json', '.sql', '.py'].includes(ext);
      return true;
    });
  }, [files, selectedFileType]);

  // Handle file select in upload modal
  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    setUploadFileObj(selected);
    // Auto-populate display name if empty or default
    if (!uploadDisplayName.trim()) {
      const nameWithoutExt = selected.name.substring(0, selected.name.lastIndexOf('.')) || selected.name;
      setUploadDisplayName(nameWithoutExt);
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileObj) {
      toast.error('Silakan pilih file yang akan diunggah');
      return;
    }

    if (!uploadDisplayName.trim()) {
      toast.error('Nama file (Display Name) wajib diisi');
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || 'Umum'
      : uploadCategory.trim() || 'Umum';

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', uploadFileObj);
    formData.append('display_name', uploadDisplayName.trim());
    formData.append('category', finalCategory);
    formData.append('description', uploadDescription.trim());
    formData.append('uploaded_by', user?.name || user?.username || 'User');

    try {
      await fileService.uploadFile(formData, (event) => {
        if (event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percent);
        }
      });

      toast.success(`File "${uploadDisplayName}" berhasil diunggah!`);
      setIsUploadOpen(false);
      resetUploadForm();
      fetchAllData();
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(err.response?.data?.error || err.message || 'Gagal mengunggah file');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFileObj(null);
    setUploadDisplayName('');
    setUploadCategory('Dokumen Teknis');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setUploadDescription('');
    setUploadProgress(0);
  };

  // Open Edit Modal
  const handleOpenEdit = (file: FileStorageItem) => {
    setFileToEdit(file);
    setEditDisplayName(file.display_name);
    setEditCategory(file.category);
    setEditDescription(file.description || '');
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToEdit) return;

    if (!editDisplayName.trim()) {
      toast.error('Nama file (Display Name) wajib diisi');
      return;
    }

    setIsSavingEdit(true);
    try {
      await fileService.updateFile(fileToEdit.id, {
        display_name: editDisplayName.trim(),
        category: editCategory.trim() || 'Umum',
        description: editDescription.trim(),
      });

      toast.success('Metadata file berhasil diperbarui!');
      setFileToEdit(null);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Gagal memperbarui file');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete File
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);

    try {
      await fileService.deleteFile(fileToDelete.id);
      toast.success(`File "${fileToDelete.display_name}" berhasil dihapus!`);
      setFileToDelete(null);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Gagal menghapus file');
    } finally {
      setIsDeleting(false);
    }
  };

  // Combined category list for filter tabs (presets + server categories)
  const allAvailableCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORY_PRESETS);
    categories.forEach((c) => set.add(c));
    return Array.from(set).sort();
  }, [categories]);

  const totalPages = Math.ceil(totalFiles / limit) || 1;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
              <FolderArchive className="h-3.5 w-3.5" />
              <span>Storage & Assets</span>
            </span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              File Management
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sistem Manajemen File & Dokumen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unggah, kategorikan, simpan dengan nama khusus, dan unduh dokumen proyek secara terorganisir.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => fetchAllData(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Merefresh...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload File Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Files
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <File className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.total_files ?? totalFiles}
            </span>
            <span className="text-[10px] text-slate-400">dokumen</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs dark:border-emerald-950/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              Total Storage
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {stats?.total_size_formatted || formatBytes(stats?.total_size_bytes || 0)}
            </span>
            <span className="text-[10px] text-emerald-600">terpakai</span>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-4 shadow-2xs dark:border-indigo-950/60 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider">
              Kategori Aktif
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
              {categories.length || Object.keys(stats?.category_counts || {}).length}
            </span>
            <span className="text-[10px] text-indigo-600">kategori</span>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-4 shadow-2xs dark:border-violet-950/60 dark:bg-violet-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-violet-800 dark:text-violet-400 uppercase tracking-wider">
              File Ditampilkan
            </span>
            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-violet-700 dark:text-violet-300">
              {filteredFiles.length}
            </span>
            <span className="text-[10px] text-violet-600">dari {totalFiles}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('all');
            setPage(1);
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
          }`}
        >
          <span>Semua Kategori</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'all' ? 'bg-slate-700 dark:bg-slate-300 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
            {totalFiles}
          </span>
        </button>

        {allAvailableCategories.map((cat) => {
          const count = stats?.category_counts?.[cat];
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <span>{cat}</span>
              {count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-wrap bg-slate-50/50 dark:bg-slate-950/40">
          
          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama display, file asli, deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filters, View Toggle & Per Page */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            {/* File Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Tipe File:</span>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="all">Semua Tipe</option>
                <option value="pdf">PDF</option>
                <option value="image">Gambar (PNG/JPG/SVG)</option>
                <option value="excel">Spreadsheet (Excel/CSV)</option>
                <option value="archive">Arsip (ZIP/RAR)</option>
                <option value="code">Source Code / SQL</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden p-0.5 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Tampilan Tabel"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            {/* Per Page */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

          </div>

        </div>

        {/* Content (Table or Grid) */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <span className="text-xs font-medium">Memuat data file storage...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <FolderArchive className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada file di kategori ini</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Klik tombol &quot;Upload File Baru&quot; untuk menambahkan dokumen atau aset proyek.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Sekarang</span>
            </button>
          </div>
        ) : viewMode === 'table' ? (
          
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="px-5 py-3.5 w-12 text-center">No</th>
                  <th className="px-5 py-3.5">Nama File & Dokumen</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Deskripsi</th>
                  <th className="px-5 py-3.5 text-center">Ukuran</th>
                  <th className="px-5 py-3.5">Pengunggah</th>
                  <th className="px-5 py-3.5">Terakhir Update</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredFiles.map((file, idx) => {
                  const fileTypeStyle = getFileIcon(file.extension, file.file_type);
                  const IconComp = fileTypeStyle.icon;

                  return (
                    <tr key={file.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* No */}
                      <td className="px-5 py-4 text-center font-medium text-slate-400">
                        {(page - 1) * limit + idx + 1}
                      </td>

                      {/* File Name & Original */}
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl border ${fileTypeStyle.bg} ${fileTypeStyle.border} ${fileTypeStyle.color} shrink-0 mt-0.5 shadow-2xs`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-xs block">
                              {file.display_name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>{file.original_name}</span>
                              {file.extension && (
                                <span className="uppercase font-bold text-[9px] bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500">
                                  {file.extension.replace('.', '')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/50">
                          <Tag className="h-3 w-3" />
                          <span>{file.category}</span>
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {file.description || '-'}
                        </p>
                      </td>

                      {/* Size */}
                      <td className="px-5 py-4 text-center font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {formatBytes(file.file_size)}
                      </td>

                      {/* Uploaded By */}
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{file.uploaded_by || 'User'}</span>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="px-5 py-4 text-slate-500">
                        {file.updated_at ? (
                          <div className="space-y-0.5 min-w-[155px]">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                              <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                              <span className="font-mono text-[11px]">{format(new Date(file.updated_at), 'dd MMM yyyy, HH:mm:ss')}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 pl-5 font-medium">
                              {formatDistanceToNow(new Date(file.updated_at), { addSuffix: true, locale: idLocale })}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Actions (Icon-only) */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Download Button */}
                          <a
                            href={fileService.getDownloadUrl(file.id)}
                            download
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Preview Button */}
                          <a
                            href={fileService.getViewUrl(file.file_path)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer"
                            title="Buka / Preview di Browser"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(file)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer"
                            title="Edit Informasi File"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer"
                            title="Hapus File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          
          /* GRID VIEW */
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const fileTypeStyle = getFileIcon(file.extension, file.file_type);
              const IconComp = fileTypeStyle.icon;

              return (
                <div
                  key={file.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-3 rounded-2xl border ${fileTypeStyle.bg} ${fileTypeStyle.border} ${fileTypeStyle.color} shadow-2xs`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900">
                        {file.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {file.display_name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono line-clamp-1 mt-0.5">
                        {file.original_name}
                      </p>
                    </div>

                    {file.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {file.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                      {formatBytes(file.file_size)}
                    </span>

                    <div className="flex items-center gap-1">
                      <a
                        href={fileService.getDownloadUrl(file.id)}
                        download
                        className="p-1 text-slate-500 hover:text-emerald-600 transition-colors"
                        title="Download File"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={fileService.getViewUrl(file.file_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(file)}
                        className="p-1 text-slate-500 hover:text-amber-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileToDelete(file)}
                        className="p-1 text-slate-500 hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Menampilkan {totalFiles ? (page - 1) * limit + 1 : 0} s/d {Math.min(page * limit, totalFiles)} dari {totalFiles} files
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300 px-2">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🚀 MODAL: UPLOAD FILE BARU */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div 
            className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Upload File & Dokumen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih file, tentukan nama display dan kategorinya.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isUploading) {
                    setIsUploadOpen(false);
                    resetUploadForm();
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              
              {/* File Dropzone / Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Pilih File <span className="text-red-500">*</span>
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingInsideModal(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingInsideModal(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingInsideModal(false);
                    const dropped = e.dataTransfer.files?.[0];
                    if (dropped) handleFileSelect(dropped);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
                    isDraggingInsideModal
                      ? 'border-indigo-500 bg-indigo-50/80 dark:border-indigo-400 dark:bg-indigo-950/60 scale-[1.02] shadow-lg ring-4 ring-indigo-500/20'
                      : uploadFileObj
                      ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {isDraggingInsideModal ? (
                    <div className="space-y-1.5 py-2 animate-pulse">
                      <Upload className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto animate-bounce" />
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        Lepaskan file di sini!
                      </p>
                      <p className="text-[10px] text-indigo-500">
                        File akan otomatis terbaca dan siap diisi detailnya.
                      </p>
                    </div>
                  ) : uploadFileObj ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {uploadFileObj.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {formatBytes(uploadFileObj.size)} &bull; {uploadFileObj.type || 'File'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Ganti File (atau Drag File Lain)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="h-7 w-7 text-indigo-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Tarik & Lepas (Drag and Drop) file ke sini, atau klik untuk memilih
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Mendukung PDF, Word, Excel, Gambar, ZIP, Source Code, dll.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nama File / Judul Display <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadDisplayName}
                  onChange={(e) => setUploadDisplayName(e.target.value)}
                  placeholder="Contoh: Dokumen Blueprint Sistem V1 atau SOP Deployment"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400">
                  Nama judul ini yang akan ditampilkan di daftar file dan antarmuka dashboard.
                </p>
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Kategori File <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {isCustomCategory ? '&larr; Pilih dari daftar' : '+ Buat Kategori Baru'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Ketik nama kategori baru (contoh: Arsip Kontrak 2026)"
                    className="w-full rounded-xl border border-indigo-300 bg-indigo-50/30 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-900 dark:bg-slate-950 dark:text-slate-100 font-semibold"
                  />
                ) : (
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 font-medium"
                  >
                    {allAvailableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Catatan / Keterangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Keterangan singkat tentang isi dokumen..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>Mengunggah file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setIsUploadOpen(false);
                    resetUploadForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isUploading || !uploadFileObj}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-2xs transition-colors disabled:opacity-50"
                >
                  {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{isUploading ? 'Mengunggah...' : 'Upload File'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ MODAL: EDIT FILE METADATA */}
      {/* ========================================================================= */}
      {fileToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Informasi File
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbarui nama judul display, kategori, atau catatan file.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFileToEdit(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nama File Display <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Kategori
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Catatan / Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFileToEdit(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-2xs transition-colors"
                >
                  {isSavingEdit ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>{isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🗑️ MODAL: DELETE FILE CONFIRMATION */}
      {/* ========================================================================= */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div 
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 w-fit">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus File Storage?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus file <strong className="text-slate-800 dark:text-slate-200">{fileToDelete.display_name}</strong>? File fisik dan riwayat pada server akan dihapus secara permanen.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-2xs transition-colors"
              >
                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>{isDeleting ? 'Menghapus...' : 'Hapus File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📥 GLOBAL FULL-PAGE DRAG & DROP OVERLAY */}
      {/* ========================================================================= */}
      {isDraggingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-indigo-900/60 backdrop-blur-md animate-in fade-in duration-200 pointer-events-none">
          <div className="w-full max-w-xl p-10 rounded-3xl border-4 border-dashed border-white/80 bg-white/10 dark:bg-slate-900/60 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 text-white animate-in zoom-in-95 duration-150">
            <div className="p-5 rounded-3xl bg-white/20 backdrop-blur-sm text-white shadow-xl animate-bounce">
              <Upload className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight">
                Lepaskan File di Sini untuk Upload
              </h3>
              <p className="text-sm text-indigo-100 mt-1 max-w-md">
                File akan otomatis dimuat ke formulir upload dengan penamaan dan kategori yang siap dikustomisasi.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
