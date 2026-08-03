'use client';

import { useState, useRef } from 'react';
import { useProjectFiles, useUploadProjectFiles, useDeleteProjectFile } from '../hooks/use-project-files';
import { ProjectFile } from '../services/project-file.service';
import {
  FolderOpen, Paperclip, Upload, Loader2, X, Trash2,
  FileText, FileImage, FileArchive, File as FileIcon, ExternalLink,
  Plus, Tag
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
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

      {/* Files List */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-4 text-center">
          No files uploaded to this project yet.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {files.map((file) => (
            <div
              key={file.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors group"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getFileIcon(file.file_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {file.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({file.file_name})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{formatBytes(file.file_size)}</span>
                    <span>•</span>
                    <span>Uploaded {format(new Date(file.created_at), 'dd MMM yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`http://localhost:8081${file.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View / Download
                </a>
                <button
                  type="button"
                  onClick={() => setFileToDelete(file)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
