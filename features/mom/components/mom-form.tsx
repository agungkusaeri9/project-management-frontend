'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

import { useCreateMoM, useUpdateMoM, useUploadMoMFiles } from '../hooks/use-moms';
import { useProjects } from '../../project/hooks/use-projects';
import { useUsers } from '../../user/hooks/use-users';
import { useCustomerContacts, useCreateCustomerContact } from '../../customer-contact/hooks/use-customer-contacts';
import { useAuthStore } from '../../../store/auth.store';
import { MoM, MoMFile } from '../services/mom.service';
import { AttendanceCombobox, AttendanceSuggestion } from './attendance-combobox';
import { FilePreviewModal } from './file-preview-modal';
import {
  Loader2, Upload, X, FileText, FileImage, FileArchive,
  File as FileIcon, ChevronLeft, Save, Paperclip, Users, Building, Maximize2
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

const parseAttendees = (raw?: string | null): string[] => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'clean'],
  ],
};

export function MoMForm({ momToEdit }: MoMFormProps) {
  const router = useRouter();
  const isEdit = !!momToEdit;

  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();
  const { mutate: createMoM, isPending: isCreating } = useCreateMoM();
  const { mutate: updateMoM, isPending: isUpdating } = useUpdateMoM();
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadMoMFiles();
  const { mutate: createCustomerContact } = useCreateCustomerContact();

  const currentUser = useAuthStore((state) => state.user);
  const [projectId, setProjectId] = useState(momToEdit?.project_id ?? '');
  const [title, setTitle] = useState(momToEdit?.title ?? '');
  const [meetingDate, setMeetingDate] = useState(
    momToEdit?.meeting_date
      ? format(new Date(momToEdit.meeting_date), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  );
  const [location, setLocation] = useState(momToEdit?.location ?? '');
  const [description, setDescription] = useState(momToEdit?.description ?? '');
  const [longDescription, setLongDescription] = useState(momToEdit?.long_description ?? '');

  // Split attendees: Internal (from users) & External (from customer contacts)
  const [internalAttendees, setInternalAttendees] = useState<string[]>(() => {
    if (momToEdit?.internal_attendees) {
      return parseAttendees(momToEdit.internal_attendees);
    }
    if (!momToEdit?.external_attendees && momToEdit?.attendees) {
      return parseAttendees(momToEdit.attendees);
    }
    return [];
  });

  const [externalAttendees, setExternalAttendees] = useState<string[]>(() => {
    if (momToEdit?.external_attendees) {
      return parseAttendees(momToEdit.external_attendees);
    }
    return [];
  });

  // Selected project & customer info
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const customerId = selectedProject?.customer_id;
  const customerName = selectedProject?.customer_name;

  // Fetch external contacts for the selected project's customer
  const { data: customerContacts = [] } = useCustomerContacts(customerId || undefined);

  // Suggestions for Internal (Users)
  const internalSuggestions = useMemo<AttendanceSuggestion[]>(() => {
    return users.map((u: any) => ({
      id: u.id,
      name: u.name,
      subtitle: u.username ? `@${u.username}` : undefined,
      badge: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Team Member',
    }));
  }, [users]);

  // Suggestions for External (Customer Contacts)
  const externalSuggestions = useMemo<AttendanceSuggestion[]>(() => {
    return customerContacts.map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: c.email || undefined,
      badge: c.position || customerName || 'Client',
    }));
  }, [customerContacts, customerName]);

  const handleAddInternal = (name: string) => {
    if (!internalAttendees.includes(name)) {
      setInternalAttendees((prev) => [...prev, name]);
    }
  };

  const handleRemoveInternal = (name: string) => {
    setInternalAttendees((prev) => prev.filter((n) => n !== name));
  };

  const handleAddExternal = (name: string) => {
    if (!externalAttendees.includes(name)) {
      setExternalAttendees((prev) => [...prev, name]);

      // Automatically persist new contact to customer_contacts if customer_id is available
      if (customerId) {
        const alreadyExists = customerContacts.some(
          (c) => c.name.toLowerCase().trim() === name.toLowerCase().trim()
        );
        if (!alreadyExists) {
          createCustomerContact({
            customer_id: customerId,
            name: name,
          });
        }
      }
    }
  };

  const handleRemoveExternal = (name: string) => {
    setExternalAttendees((prev) => prev.filter((n) => n !== name));
  };

  // Existing files (edit mode)
  const [existingFiles, setExistingFiles] = useState<MoMFile[]>(momToEdit?.files ?? []);
  const [deleteFileIds, setDeleteFileIds] = useState<string[]>([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFileIndex, setPreviewFileIndex] = useState(0);

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

    // Only Title / Name is required!
    if (!title.trim()) {
      toast.error('Judul / Nama Rapat (Title) wajib diisi');
      return;
    }

    try {
      // First upload any new local files
      let uploadedFiles: MoMFile[] = [];
      if (newLocalFiles.length > 0) {
        uploadedFiles = await uploadFiles(newLocalFiles);
      }

      const combinedAttendees = [...internalAttendees, ...externalAttendees].join(', ') || null;
      const internalStr = internalAttendees.join(', ') || null;
      const externalStr = externalAttendees.join(', ') || null;
      const effectiveMeetingDate = meetingDate || format(new Date(), 'yyyy-MM-dd');
      const effectiveProjectId = projectId.trim() ? projectId : null;

      if (isEdit && momToEdit) {
        updateMoM(
          {
            id: momToEdit.id,
            data: {
              project_id: effectiveProjectId,
              title: title.trim(),
              meeting_date: effectiveMeetingDate,
              location: location.trim() || null,
              attendees: combinedAttendees,
              internal_attendees: internalStr,
              external_attendees: externalStr,
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
              router.push('/dashboard/moms');
            },
            onError: () => toast.error('Failed to update MoM'),
          }
        );
      } else {
        createMoM(
          {
            project_id: effectiveProjectId,
            title: title.trim(),
            meeting_date: effectiveMeetingDate,
            location: location.trim() || null,
            attendees: combinedAttendees,
            internal_attendees: internalStr,
            external_attendees: externalStr,
            description: description.trim() || null,
            long_description: longDescription.trim() || null,
            created_by: currentUser?.name || 'Admin',
            files: uploadedFiles,
          },
          {
            onSuccess: () => {
              toast.success('MoM created successfully');
              router.push('/dashboard/moms');
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
          href="/dashboard/moms"
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
          {/* Title / Name (ONLY REQUIRED FIELD) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Judul / Nama Rapat (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Sprint Planning Meeting Q1"
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all font-medium"
            />
          </div>

          {/* Project (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Project <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              <option value="">-- Pilih Project (Opsional) --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}{p.customer_name ? ` — ${p.customer_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Date (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tanggal Rapat <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Location (Optional) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Lokasi / Media Rapat <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ruang Rapat Lt. 2 / Online via Google Meet / Zoom"
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Attendees Section (Divided into Internal Team & External Client) */}
          <div className="md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Daftar Peserta Rapat (Attendees)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pilih dari daftar anggota atau ketik nama baru lalu tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold">Enter</kbd> untuk menambahkan.
                </p>
              </div>

              {selectedProject?.customer_name && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Building className="w-3.5 h-3.5" />
                  <span>Klien: {selectedProject.customer_name}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
              {/* Internal Team Attendees */}
              <div className="space-y-2">
                <AttendanceCombobox
                  label="Internal Team"
                  badgeLabel="Internal Team"
                  description="Peserta rapat dari tim internal pengembang / staf (dari master users)."
                  placeholder="Cari user atau ketik nama lalu Enter..."
                  selectedNames={internalAttendees}
                  onAdd={handleAddInternal}
                  onRemove={handleRemoveInternal}
                  suggestions={internalSuggestions}
                  variant="internal"
                />
              </div>

              {/* External Client Attendees */}
              <div className="space-y-2">
                <AttendanceCombobox
                  label="External (Customer / Client)"
                  badgeLabel={selectedProject?.customer_name ? `Client: ${selectedProject.customer_name}` : 'External Client'}
                  description={
                    selectedProject?.customer_name
                      ? `Peserta rapat dari pihak ${selectedProject.customer_name}. Nama baru akan otomatis tersimpan sebagai kontak customer.`
                      : 'Peserta rapat dari pihak klien eksternal. Pilih project untuk memfilter kontak klien.'
                  }
                  placeholder="Cari kontak klien atau ketik nama lalu Enter..."
                  selectedNames={externalAttendees}
                  onAdd={handleAddExternal}
                  onRemove={handleRemoveExternal}
                  suggestions={externalSuggestions}
                  variant="external"
                />
              </div>
            </div>
          </div>

          {/* Description (Brief summary) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Ringkasan Pembahasan (Description) <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Ringkasan singkat topik pembahasan rapat..."
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
            />
          </div>

          {/* Detailed Notes / Minutes (WYSIWYG Rich Text Editor) */}
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Detailed Notes / Minutes (Notulen Lengkap) <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                WYSIWYG Rich Editor (Bold, Lists, Headings, Code, Links)
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs">
              <ReactQuill
                theme="snow"
                value={longDescription}
                onChange={setLongDescription}
                modules={quillModules}
                placeholder="Tuliskan notulen rapat lengkap, poin kesepakatan, action items, catatan penting..."
                style={{ minHeight: '260px', paddingBottom: '42px' }}
              />
            </div>
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
            {existingFiles.map((f, idx) => (
              <div
                key={f.id || idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 group hover:border-indigo-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                  {getFileIcon(f.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{f.file_name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(f.file_size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewFileIndex(idx);
                    setPreviewModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => f.id && removeExistingFile(f.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Hapus lampiran"
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
                  title="Batalkan file"
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
          href="/dashboard/moms"
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

      {/* XXL File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        files={existingFiles}
        initialIndex={previewFileIndex}
      />
    </form>
  );
}
