'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProjectFiles, useUploadProjectFiles, useDeleteProjectFile } from '../hooks/use-project-files';
import { ProjectFile } from '../services/project-file.service';
import {
  FolderOpen, Paperclip, Upload, Loader2, X, Trash2,
  FileText, FileImage, FileArchive, File as FileIcon, ExternalLink,
  Plus, Tag, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

function getFileIcon(fileType?: string | null) {
  if (!fileType) return <FileIcon className="w-4 h-4" />;
  if (fileType.includes('image')) return <FileImage className="w-4 h-4" />;
  if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="w-4 h-4" />;
  return <FileIcon className="w-4 h-4" />;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ProjectFilesSection({ projectId }: { projectId: string }) {
  const { data: files = [], isLoading } = useProjectFiles(projectId);
  const { mutate: uploadFiles, isPending: isUploading } = useUploadProjectFiles();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteProjectFile(projectId);

  const [title, setTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'pdf' | 'archive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...fileList]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    uploadFiles(
      { projectId, title: title.trim(), files: selectedFiles },
      {
        onSuccess: () => {
          toast.success('Files uploaded successfully');
          setTitle('');
          setSelectedFiles([]);
          setShowUploadForm(false);
        },
        onError: () => {
          toast.error('Failed to upload files');
        },
      }
    );
  };

  const handleDelete = () => {
    if (!fileToDelete) return;
    deleteFile(fileToDelete.id, {
      onSuccess: () => {
        toast.success('File deleted successfully');
        setFileToDelete(null);
      },
      onError: () => {
        toast.error('Failed to delete file');
      },
    });
  };

  // Gallery Navigation Logic
  const galleryFiles = files.filter(f => !f.file_type?.includes('zip') && !f.file_type?.includes('rar'));
  const currentPreviewIndex = previewFile ? galleryFiles.findIndex(f => f.id === previewFile.id) : -1;
  const hasPrevious = currentPreviewIndex > 0;
  const hasNext = currentPreviewIndex < galleryFiles.length - 1;

  const showPrevious = () => {
    if (hasPrevious) setPreviewFile(galleryFiles[currentPreviewIndex - 1]);
  };

  const showNext = () => {
    if (hasNext) setPreviewFile(galleryFiles[currentPreviewIndex + 1]);
  };

  const filteredFiles = files.filter((f) => {
    const matchesFilter = (() => {
      if (filterType === 'all') return true;
      if (filterType === 'image') return f.file_type?.includes('image');
      if (filterType === 'pdf') return f.file_type?.includes('pdf');
      if (filterType === 'archive') return f.file_type?.includes('zip') || f.file_type?.includes('rar');
      return true;
    })();

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (f.title && f.title.toLowerCase().includes(searchLower)) || 
      (f.file_name && f.file_name.toLowerCase().includes(searchLower));

    return matchesFilter && matchesSearch;
  });

  const INITIAL_LIMIT = 8;
  const displayedFiles = showAllFiles ? filteredFiles : filteredFiles.slice(0, INITIAL_LIMIT);
  const hasMoreFiles = filteredFiles.length > INITIAL_LIMIT;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Project Files</h2>
          <span className="text-xs text-slate-400">({files.length})</span>
        </div>
        <button
          type="button"
          onClick={() => setShowUploadForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm"
        >
          {showUploadForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showUploadForm ? 'Cancel' : 'Upload Files'}
        </button>
      </div>

      {/* Filter Badges and Search */}
      {!isLoading && files.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'image', 'pdf', 'archive'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFilterType(type as any);
                  setShowAllFiles(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === type
                    ? 'bg-slate-800 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {type === 'all' ? 'All Files' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAllFiles(false);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-4">
          <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Upload New Project Files
          </h3>

          {/* Mandatory Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              File Title / Document Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Technical Specification V1, System Diagram"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Multiple Files <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5" />
                Choose Files
              </button>
              <span className="text-xs text-slate-400">
                {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'No file chosen'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {selectedFiles.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {getFileIcon(f.type)}
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{f.name}</span>
                    <span className="text-slate-400 text-[10px]">({formatBytes(f.size)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/30">
            <button
              type="button"
              onClick={() => {
                setShowUploadForm(false);
                setTitle('');
                setSelectedFiles([]);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0 || !title.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Files Grid */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No files uploaded to this project yet.
        </p>
      ) : filteredFiles.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No files matching this filter.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {displayedFiles.map((file) => {
              const isArchive = file.file_type?.includes('zip') || file.file_type?.includes('rar');
            
            return (
              <div
                key={file.id}
                onClick={() => {
                  if (isArchive) {
                    toast.error('File ZIP tidak dapat dibuka atau ditampilkan melalui preview.');
                    return;
                  }
                  setPreviewFile(file);
                }}
                className={`group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/50 overflow-hidden ${
                  isArchive ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {/* Delete Button (Floating) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileToDelete(file);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-10 shadow-sm"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Thumbnail Area */}
                <div className="w-full h-32 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
                  {file.file_type?.includes('image') ? (
                    <img
                      src={`http://localhost:8081${file.file_path}`}
                      alt={file.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isArchive ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}>
                      {getFileIcon(file.file_type)}
                    </div>
                  )}
                </div>
                
                {/* Details Area */}
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 mb-0.5" title={file.title}>
                    {file.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-3" title={file.file_name}>
                    {file.file_name}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider truncate max-w-[100px]">
                      {file.file_type?.split('/').pop()?.split('-').pop() || 'File'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatBytes(file.file_size)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          
          {hasMoreFiles && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllFiles(!showAllFiles)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 px-6 py-2 rounded-xl flex items-center justify-center min-w-[140px]"
              >
                {showAllFiles ? 'Show Less' : `Show All Files (${filteredFiles.length})`}
              </button>
            </div>
          )}
        </div>
      )}
      </div>

      {mounted && createPortal(
        <>
          {/* File Preview Modal */}
          {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="text-indigo-500">
                  {getFileIcon(previewFile.file_type)}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-md">
                  {previewFile.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`http://localhost:8081${previewFile.file_path}`}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 transition-colors"
                >
                  Download
                </a>
                <button onClick={() => setPreviewFile(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100/50 dark:bg-slate-950/50 overflow-hidden flex items-center justify-center p-4 relative group">
              {/* Previous Button */}
              {hasPrevious && (
                <button
                  onClick={showPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full backdrop-blur-md transition-all shadow-md z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {hasNext && (
                <button
                  onClick={showNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full backdrop-blur-md transition-all shadow-md z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {previewFile.file_type?.includes('image') ? (
                <img
                  src={`http://localhost:8081${previewFile.file_path}`}
                  alt={previewFile.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              ) : previewFile.file_type?.includes('pdf') ? (
                <iframe
                  src={`http://localhost:8081${previewFile.file_path}`}
                  className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                  title={previewFile.title}
                />
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <FileIcon className="w-16 h-16 mb-4 text-slate-300" />
                  <p>Preview not available for this file type.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Delete File</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Are you sure you want to delete <strong>"{fileToDelete.file_name}"</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5 disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
        </>,
        document.body
      )}
    </>
  );
}
