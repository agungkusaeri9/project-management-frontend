'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateMoM, useUpdateMoM, useUploadMoMFiles } from '../hooks/use-moms';
import { useProjects } from '../../project/hooks/use-projects';
import { useAuthStore } from '../../../store/auth.store';
import { MoM, MoMFile } from '../services/mom.service';
import {
  Loader2, Upload, X, FileText, FileImage, FileArchive,
  File as FileIcon, ChevronLeft, Save, Paperclip
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MoMFormProps {
  momToEdit?: MoM;
}

function getFileIcon(fileType?: string) {
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

export function MoMForm({ momToEdit }: MoMFormProps) {
  const router = useRouter();
  const isEdit = !!momToEdit;

  const { data: projects = [] } = useProjects();
  const { mutate: createMoM, isPending: isCreating } = useCreateMoM();
  const { mutate: updateMoM, isPending: isUpdating } = useUpdateMoM();
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadMoMFiles();

  const currentUser = useAuthStore((state) => state.user);
  const [projectId, setProjectId] = useState(momToEdit?.project_id ?? '');
  const [title, setTitle] = useState(momToEdit?.title ?? '');
  const [meetingDate, setMeetingDate] = useState(
    momToEdit?.meeting_date
      ? format(new Date(momToEdit.meeting_date), 'yyyy-MM-dd')
      : ''
  );
  const [location, setLocation] = useState(momToEdit?.location ?? '');
  const [attendees, setAttendees] = useState(momToEdit?.attendees ?? '');
  const [description, setDescription] = useState(momToEdit?.description ?? '');
  const [longDescription, setLongDescription] = useState(momToEdit?.long_description ?? '');

  // Existing files (edit mode)
  const [existingFiles, setExistingFiles] = useState<MoMFile[]>(momToEdit?.files ?? []);
  const [deleteFileIds, setDeleteFileIds] = useState<string[]>([]);

  // New files to upload
  const [newLocalFiles, setNewLocalFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSaving = isCreating || isUpdating || isUploading;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewLocalFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewFile = (index: number) => {
    setNewLocalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (fileId: string) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    setDeleteFileIds((prev) => [...prev, fileId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) { toast.error('Please select a project'); return; }
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!meetingDate) { toast.error('Meeting date is required'); return; }

    try {
      // First upload any new local files
      let uploadedFiles: MoMFile[] = [];
      if (newLocalFiles.length > 0) {
        uploadedFiles = await uploadFiles(newLocalFiles);
      }

      if (isEdit && momToEdit) {
        updateMoM(
          {
            id: momToEdit.id,
            data: {
              project_id: projectId,
              title: title.trim(),
              meeting_date: meetingDate,
              location: location.trim() || null,
              attendees: attendees.trim() || null,
              description: description.trim() || null,
              long_description: longDescription.trim() || null,
              created_by: momToEdit.created_by || currentUser?.name || 'Admin',
              new_files: uploadedFiles,
              delete_file_ids: deleteFileIds,
            },
          },
          {
            onSuccess: () => {
              toast.success('MoM updated successfully');
              router.push('/moms');
            },
            onError: () => toast.error('Failed to update MoM'),
          }
        );
      } else {
        createMoM(
          {
            project_id: projectId,
            title: title.trim(),
            meeting_date: meetingDate,
            location: location.trim() || null,
            attendees: attendees.trim() || null,
            description: description.trim() || null,
            long_description: longDescription.trim() || null,
            created_by: currentUser?.name || 'Admin',
            files: uploadedFiles,
          },
          {
            onSuccess: () => {
              toast.success('MoM created successfully');
              router.push('/moms');
            },
            onError: () => toast.error('Failed to create MoM'),
          }
        );
      }
    } catch {
      toast.error('Failed to upload files');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/moms"
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEdit ? 'Edit Minutes of Meeting' : 'New Minutes of Meeting'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isEdit ? 'Update MoM details and attachments' : 'Record a new meeting with attachments'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Meeting Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Project */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Sprint Planning Meeting Q1"
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Meeting Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Meeting Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Meeting Room A, Online (Zoom)"
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Attendees */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Attendees
            </label>
            <input
              type="text"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="e.g. John Doe, Jane Smith, Bob Johnson"
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief summary of the meeting..."
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
            />
          </div>

          {/* Long Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Notes / Minutes
            </label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              rows={7}
              placeholder="Detailed meeting notes, action items, decisions made..."
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Attachments Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Attachments
          </h2>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Add Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Drop zone if no files */}
        {existingFiles.length === 0 && newLocalFiles.length === 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Click or drag files here to attach
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Supports multiple files — PDF, images, documents, etc.
              </p>
            </div>
          </button>
        )}

        {/* Existing files (edit mode) */}
        {existingFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Existing Attachments</p>
            {existingFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                  {getFileIcon(f.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{f.file_name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(f.file_size)}</p>
                </div>
                <a
                  href={`http://localhost:8081${f.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => f.id && removeExistingFile(f.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New local files */}
        {newLocalFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">New Files to Upload</p>
            {newLocalFiles.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                  {getFileIcon(f.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(f.size)}</p>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">New</span>
                <button
                  type="button"
                  onClick={() => removeNewFile(idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {(existingFiles.length > 0 || newLocalFiles.length > 0) && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Add more files
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/moms"
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isUploading ? 'Uploading...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEdit ? 'Save Changes' : 'Create MoM'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
