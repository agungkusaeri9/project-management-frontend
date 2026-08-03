'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Loader2, FolderOpen, Box, GitBranch, AlertCircle,
  Building2, Plus, Trash2
} from 'lucide-react';
import { useCreateIssue } from '../../../../features/issue/hooks/use-issues';
import { useProjects } from '../../../../features/project/hooks/use-projects';
import { useModules } from '../../../../features/module/hooks/use-modules';
import { useFeatures } from '../../../../features/feature/hooks/use-features';
import { useSubFeatures } from '../../../../features/subfeature/hooks/use-sub-features';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];

interface IssueItemForm {
  module_id: string;
  feature_id: string;
  sub_feature_id: string;
  description: string;
}

// ── Sub-component for individual dynamic Item row ──────────────────
function IssueItemRow({
  index,
  item,
  projectId,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  item: IssueItemForm;
  projectId: string;
  canRemove: boolean;
  onChange: (updated: IssueItemForm) => void;
  onRemove: () => void;
}) {
  const { data: modules = [] } = useModules(projectId);
  const { data: features = [] } = useFeatures(item.module_id);
  const { data: subFeatures = [] } = useSubFeatures(item.feature_id);

  return (
    <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl relative space-y-4 group transition-colors hover:border-indigo-500/40">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/50 pb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Item #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Remove Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Module, Feature, Sub-Feature Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Module */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5 text-violet-500" />
            Module <span className="text-red-500">*</span>
          </label>
          <select
            value={item.module_id}
            onChange={(e) =>
              onChange({
                ...item,
                module_id: e.target.value,
                feature_id: '',
                sub_feature_id: '',
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            required
          >
            <option value="">-- Select Module --</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Feature */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-indigo-500" />
            Feature
          </label>
          <select
            value={item.feature_id}
            disabled={!item.module_id}
            onChange={(e) =>
              onChange({
                ...item,
                feature_id: e.target.value,
                sub_feature_id: '',
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
          >
            <option value="">-- Select Feature (Opt) --</option>
            {features.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Feature */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-sky-500" />
            Sub-Feature
          </label>
          <select
            value={item.sub_feature_id}
            disabled={!item.feature_id}
            onChange={(e) =>
              onChange({
                ...item,
                sub_feature_id: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
          >
            <option value="">-- Select Sub-Feature (Opt) --</option>
            {subFeatures.map((sf) => (
              <option key={sf.id} value={sf.id}>
                {sf.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Item Description */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Item Description & Error Details
        </label>
        <textarea
          rows={3}
          value={item.description}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          placeholder="Describe specific error details for this module/feature..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
        />
      </div>
    </div>
  );
}

// ── Main Create Page ───────────────────────────────────────────────
export default function CreateIssuePage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('open');
  const [description, setDescription] = useState('');

  // Dynamic Issue Items list
  const [items, setItems] = useState<IssueItemForm[]>([
    { module_id: '', feature_id: '', sub_feature_id: '', description: '' },
  ]);

  const { mutate: createIssue, isPending } = useCreateIssue();
  const { data: projects = [] } = useProjects();

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { module_id: '', feature_id: '', sub_feature_id: '', description: '' },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, updated: IssueItemForm) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('Please select a project');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    // Format items for backend payload
    const formattedItems = items.map((item) => ({
      module_id: item.module_id || null,
      feature_id: item.feature_id || null,
      sub_feature_id: item.sub_feature_id || null,
      description: item.description.trim() || null,
    }));

    const firstItem = formattedItems[0] || {};

    const payload = {
      project_id: projectId,
      title: title.trim(),
      issue_date: issueDate ? `${issueDate}T00:00:00Z` : null,
      priority,
      status,
      description: description.trim() || null,
      module_id: firstItem.module_id || null,
      feature_id: firstItem.feature_id || null,
      sub_feature_id: firstItem.sub_feature_id || null,
      items: formattedItems,
    };

    createIssue(payload, {
      onSuccess: (newIssue) => {
        toast.success('Issue created successfully!');
        if (newIssue?.id) {
          router.push(`/issues/${newIssue.id}`);
        } else {
          router.push('/issues');
        }
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Failed to create issue');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back + Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/issues"
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Create Issue
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Fill in the issue details and add dynamic module & feature items.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Issue Header & Details */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                Issue Details
              </h2>

              {/* Project Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    setItems([
                      { module_id: '', feature_id: '', sub_feature_id: '', description: '' },
                    ]);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
                {selectedProject?.customer_name && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    Customer: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedProject.customer_name}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dashboard login fails"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Overall Description */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Overall Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="General issue description or overview..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Issue Items */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-indigo-500" />
                  Issue Items ({items.length})
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!projectId}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {!projectId ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  Please select a project first to add issue items.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <IssueItemRow
                      key={index}
                      index={index}
                      item={item}
                      projectId={projectId}
                      canRemove={items.length > 1}
                      onChange={(updated) => updateItem(index, updated)}
                      onRemove={() => removeItem(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/issues"
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending || !projectId || !title.trim()}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-indigo-500/20 transition-all text-sm"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Issue
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
