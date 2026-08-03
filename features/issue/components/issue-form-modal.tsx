'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Issue } from '../services/issue.service';
import { useCreateIssue, useUpdateIssue } from '../hooks/use-issues';
import { useProjects } from '../../project/hooks/use-projects';
import { X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];

interface IssueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueToEdit?: Issue | null;
}

export function IssueFormModal({ isOpen, onClose, issueToEdit }: IssueFormModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState('');
  const [issueDate, setIssueDate] = useState('');

  const { mutate: createIssue, isPending: isCreating } = useCreateIssue();
  const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue();
  const { data: projects = [] } = useProjects();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setTitle(issueToEdit?.title ?? '');
      setDescription(issueToEdit?.description ?? '');
      setStatus(issueToEdit?.status ?? 'open');
      setPriority(issueToEdit?.priority ?? 'medium');
      setProjectId(issueToEdit?.project_id ?? '');
      setIssueDate(
        issueToEdit?.issue_date
          ? issueToEdit.issue_date.split('T')[0]
          : today
      );
    }
  }, [isOpen, issueToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      project_id: projectId || null,
      issue_date: issueDate ? `${issueDate}T00:00:00Z` : null,
    };

    if (issueToEdit) {
      updateIssue(
        { id: issueToEdit.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Issue updated');
            onClose();
          },
          onError: () => toast.error('Failed to update issue'),
        }
      );
    } else {
      createIssue(payload, {
        onSuccess: (newIssue: Issue) => {
          toast.success('Issue created! Redirecting to detail...');
          onClose();
          if (newIssue?.id) {
            router.push(`/issues/${newIssue.id}`);
          }
        },
        onError: () => toast.error('Failed to create issue'),
      });
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {issueToEdit ? 'Edit Issue' : 'Add New Issue'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {issueToEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Issue Code (Read-Only)
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {issueToEdit.issue_code}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Describe the issue..."
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
            />
          </div>

          {/* Project (Full width) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Project <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Select Project --</option>
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name} {p.customer_name ? `(${p.customer_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-900 dark:text-slate-100"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-900 dark:text-slate-100"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p} className={priorityColor(p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Issue Date (Full width) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Issue description..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-indigo-500/20 transition-all"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {issueToEdit ? 'Save Changes' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
