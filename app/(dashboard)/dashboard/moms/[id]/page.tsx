'use client';

import { useState, use } from 'react';
import { useMoM } from '@/features/mom/hooks/use-moms';
import { FilePreviewModal } from '@/features/mom/components/file-preview-modal';
import {
  Loader2, AlertCircle, ChevronLeft, FileText, Calendar,
  MapPin, Users, User, Paperclip, Edit2, FileImage,
  FileArchive, File as FileIcon, ExternalLink, Hash, Briefcase, Maximize2
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface MoMDetailPageProps {
  params: Promise<{ id: string }>;
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

export default function MoMDetailPage({ params }: MoMDetailPageProps) {
  const { id } = use(params);
  const { data: mom, isLoading, isError } = useMoM(id);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFileIndex, setPreviewFileIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !mom) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-slate-600 dark:text-slate-400">MoM not found or failed to load.</p>
        <Link href="/dashboard/moms" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/moms"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {mom.project_code ? `[${mom.project_code}] ` : ''}{mom.project_name || '-'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{mom.title}</h1>
          </div>
        </div>
        <Link
          href={`/dashboard/moms/${mom.id}/edit`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Meta Info Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
          MoM Metadata & Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* MoM ID */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">MoM ID</p>
              <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                {mom.id}
              </p>
            </div>
          </div>

          {/* Project */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Project</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {mom.project_name || '-'}
                {mom.customer_name ? ` (${mom.customer_name})` : ''}
              </p>
            </div>
          </div>

          {/* Meeting Date */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Meeting Date</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {mom.meeting_date ? format(new Date(mom.meeting_date), 'dd MMMM yyyy') : '-'}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Location</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {mom.location || '-'}
              </p>
            </div>
          </div>

          {/* Created By */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Created By</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {mom.created_by || '-'}
              </p>
            </div>
          </div>

          {/* Attendees Section (Divided into Internal Team & External Client) */}
          <div className="sm:col-span-2 lg:col-span-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">
                Daftar Peserta Rapat (Attendance)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Internal Attendees */}
              <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                    <User className="w-3.5 h-3.5" />
                    <span>Internal Team</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-600/70 dark:text-blue-400/70">
                    {(mom.internal_attendees || (!mom.external_attendees ? mom.attendees : ''))
                      ?.split(',')
                      .map((s) => s.trim())
                      .filter(Boolean).length || 0} peserta
                  </span>
                </div>
                {(mom.internal_attendees || (!mom.external_attendees ? mom.attendees : '')) ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(mom.internal_attendees || (!mom.external_attendees ? mom.attendees : ''))
                      ?.split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((name, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {name}
                        </span>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Tidak ada peserta internal tercatat</p>
                )}
              </div>

              {/* External Attendees */}
              <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>External Client {mom.customer_name ? `(${mom.customer_name})` : ''}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600/70 dark:text-emerald-400/70">
                    {mom.external_attendees?.split(',').map((s) => s.trim()).filter(Boolean).length || 0} peserta
                  </span>
                </div>
                {mom.external_attendees ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mom.external_attendees
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((name, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {name}
                        </span>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Tidak ada peserta klien eksternal tercatat</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Description
        </h2>
        {mom.description ? (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {mom.description}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic">No description provided</p>
        )}
      </div>

      {/* Long Description / Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 max-w-full overflow-hidden">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Detailed Meeting Notes / Minutes (Notulen Lengkap)
        </h2>
        {mom.long_description ? (
          <div
            className="w-full max-w-full text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-100 dark:border-slate-800 break-words [word-break:break-word] [overflow-wrap:anywhere] overflow-x-auto [&_*]:max-w-full [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2.5 [&_h2]:mt-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-2.5 [&_h4]:text-base [&_h4]:font-bold [&_h4]:mb-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-3 [&_blockquote]:my-3 [&_blockquote]:italic [&_code]:bg-slate-200 dark:[&_code]:bg-slate-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-3.5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-3 [&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:underline [&_a]:break-all [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_th]:border [&_th]:border-slate-300 dark:[&_th]:border-slate-700 [&_th]:p-2 [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800 [&_th]:font-semibold [&_td]:border [&_td]:border-slate-300 dark:[&_td]:border-slate-700 [&_td]:p-2 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: mom.long_description }}
          />
        ) : (
          <p className="text-sm text-slate-400 italic">Tidak ada notulen detail tercatat.</p>
        )}
      </div>

      {/* Attachments */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Paperclip className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Attachments
          </h2>
          {mom.files && mom.files.length > 0 && (
            <span className="ml-auto text-xs text-slate-400">{mom.files.length} file{mom.files.length > 1 ? 's' : ''}</span>
          )}
        </div>

        {!mom.files || mom.files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Paperclip className="w-5 h-5 text-slate-400" />
            <p className="text-sm text-slate-400 italic">No file attachments uploaded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mom.files.map((f, idx) => (
              <button
                key={f.id || idx}
                type="button"
                onClick={() => {
                  setPreviewFileIndex(idx);
                  setPreviewModalOpen(true);
                }}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                  {getFileIcon(f.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {f.file_name}
                  </p>
                  <p className="text-xs text-slate-400">{formatBytes(f.file_size)} • Klik untuk melihat preview (layar penuh)</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-2xs">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Created: {mom.created_at ? format(new Date(mom.created_at), 'dd MMM yyyy HH:mm') : '-'}</span>
        <span>Last Updated: {mom.updated_at ? format(new Date(mom.updated_at), 'dd MMM yyyy HH:mm') : '-'}</span>
      </div>

      {/* XXL File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        files={mom.files || []}
        initialIndex={previewFileIndex}
      />
    </div>
  );
}
