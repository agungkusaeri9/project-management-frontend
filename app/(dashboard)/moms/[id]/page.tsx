'use client';

import { use } from 'react';
import { useMoM } from '../../../../features/mom/hooks/use-moms';
import {
  Loader2, AlertCircle, ChevronLeft, FileText, Calendar,
  MapPin, Users, User, Paperclip, Edit2, FileImage,
  FileArchive, File as FileIcon, ExternalLink, Hash, Briefcase
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
        <Link href="/moms" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/moms"
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
          href={`/moms/${mom.id}/edit`}
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

          {/* Attendees */}
          <div className="sm:col-span-2 lg:col-span-3 flex items-start gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Attendees</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {mom.attendees || '-'}
              </p>
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Detailed Meeting Notes / Minutes
        </h2>
        {mom.long_description ? (
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            {mom.long_description}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No detailed notes provided</p>
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
            {mom.files.map((f) => (
              <a
                key={f.id}
                href={`http://localhost:8081${f.file_path}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                  {getFileIcon(f.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{f.file_name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(f.file_size)}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Created: {mom.created_at ? format(new Date(mom.created_at), 'dd MMM yyyy HH:mm') : '-'}</span>
        <span>Last Updated: {mom.updated_at ? format(new Date(mom.updated_at), 'dd MMM yyyy HH:mm') : '-'}</span>
      </div>
    </div>
  );
}
