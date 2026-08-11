'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import {
  ArrowLeft, Save, Loader2, FolderOpen, Box, GitBranch, AlertCircle,
  Building2, Plus, Trash2, Edit2, ListChecks
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
  module_name?: string;
  feature_id: string;
  feature_name?: string;
  sub_feature_id: string;
  sub_feature_name?: string;
  title: string;
  description: string;
}

export default function CreateIssuePage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [projectId, setProjectId] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('open');

  // Issue Items list
  const [items, setItems] = useState<IssueItemForm[]>([]);

  // Draft Item state
  const initialDraft: IssueItemForm = {
    module_id: '',
    module_name: '',
    feature_id: '',
    feature_name: '',
    sub_feature_id: '',
    sub_feature_name: '',
    title: '',
    description: ''
  };
  const [draftItem, setDraftItem] = useState<IssueItemForm>(initialDraft);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const { mutate: createIssue, isPending } = useCreateIssue();
  const { data: projects = [] } = useProjects();
  const { data: modules = [] } = useModules(projectId);
  const { data: features = [] } = useFeatures(draftItem.module_id);
  const { data: subFeatures = [] } = useSubFeatures(draftItem.feature_id);

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const handleAddOrUpdateItem = () => {
    if (!draftItem.module_id) {
      toast.error('Module is required for the issue item');
      return;
    }
    
    if (editIndex !== null) {
      setItems((prev) => {
        const next = [...prev];
        next[editIndex] = draftItem;
        return next;
      });
      toast.success('Item updated');
    } else {
      setItems((prev) => [...prev, draftItem]);
      toast.success('Item added');
    }
    
    setDraftItem(initialDraft);
    setEditIndex(null);
  };

  const handleEditItem = (index: number) => {
    setDraftItem(items[index]);
    setEditIndex(index);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) {
      setDraftItem(initialDraft);
      setEditIndex(null);
    } else if (editIndex !== null && index < editIndex) {
      setEditIndex(editIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('Please select a project');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one issue item');
      return;
    }

    // Format items for backend payload
    const formattedItems = items.map((item) => ({
      module_id: item.module_id || null,
      feature_id: item.feature_id || null,
      sub_feature_id: item.sub_feature_id || null,
      title: item.title?.trim() || null,
      description: item.description?.trim() || null,
    }));

    const firstItem = formattedItems[0] || {};

    const payload = {
      project_id: projectId,
      issue_date: issueDate ? `${issueDate}T00:00:00Z` : null,
      priority,
      status,
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
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center justify-between gap-4">
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
              Fill in the issue details and manage issue items.
            </p>
          </div>
        </div>
        
        {/* Action Buttons (Top Right) */}
        <div className="flex items-center gap-3">
          <Link
            href="/issues"
            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isPending || !projectId || items.length === 0}
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

      <div className="space-y-6">
        {/* 1. Issue Details Card (Full Width, 4 cols) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
            Issue Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Project Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setItems([]);
                  setDraftItem(initialDraft);
                  setEditIndex(null);
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
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  Customer: <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedProject.customer_name}</span>
                </div>
              )}
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 capitalize"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 capitalize"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Issue Items Management (50/50 layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Item Draft Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-500" />
                {editIndex !== null ? 'Edit Issue Item' : 'Add Issue Item'}
              </h2>
            </div>

            {!projectId ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                Please select a project first to manage issue items.
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {/* Selectors Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-violet-500" />
                      Module <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={draftItem.module_id}
                      onChange={(e) => {
                        const m = modules.find(x => x.id === e.target.value);
                        setDraftItem({
                          ...draftItem,
                          module_id: e.target.value,
                          module_name: m?.name || '',
                          feature_id: '',
                          feature_name: '',
                          sub_feature_id: '',
                          sub_feature_name: '',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="">-- Select Module --</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-indigo-500" />
                      Feature
                    </label>
                    <select
                      value={draftItem.feature_id}
                      disabled={!draftItem.module_id}
                      onChange={(e) => {
                        const f = features.find(x => x.id === e.target.value);
                        setDraftItem({
                          ...draftItem,
                          feature_id: e.target.value,
                          feature_name: f?.name || '',
                          sub_feature_id: '',
                          sub_feature_name: '',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                    >
                      <option value="">-- Select (Opt) --</option>
                      {features.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-sky-500" />
                      Sub-Feature
                    </label>
                    <select
                      value={draftItem.sub_feature_id}
                      disabled={!draftItem.feature_id}
                      onChange={(e) => {
                        const sf = subFeatures.find(x => x.id === e.target.value);
                        setDraftItem({
                          ...draftItem,
                          sub_feature_id: e.target.value,
                          sub_feature_name: sf?.name || '',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                    >
                      <option value="">-- Select (Opt) --</option>
                      {subFeatures.map((sf) => (
                        <option key={sf.id} value={sf.id}>{sf.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Item Title */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Item Title <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={draftItem.title || ''}
                    onChange={(e) => setDraftItem({ ...draftItem, title: e.target.value })}
                    placeholder="Brief title for this item..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Item Description (Rich Text) */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Item Description & Error Details
                  </label>
                  <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <ReactQuill
                      theme="snow"
                      value={draftItem.description || ''}
                      onChange={(content) => setDraftItem({ ...draftItem, description: content })}
                      style={{ height: '220px', marginBottom: '40px' }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  {editIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftItem(initialDraft);
                        setEditIndex(null);
                      }}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddOrUpdateItem}
                    disabled={!draftItem.module_id}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {editIndex !== null ? (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Update Item
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Item
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Added Items List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-500" />
                Added Items ({items.length})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <ListChecks className="w-8 h-8 mb-3 text-slate-300 dark:text-slate-600" />
                  <p>No items added yet.</p>
                  <p className="text-xs mt-1">Use the form on the left to add items.</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border transition-colors ${
                      editIndex === index 
                        ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                            {item.module_name || 'Module'}
                          </span>
                          {item.feature_name && (
                            <>
                              <span>›</span>
                              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                {item.feature_name}
                              </span>
                            </>
                          )}
                          {item.sub_feature_name && (
                            <>
                              <span>›</span>
                              <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                {item.sub_feature_name}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {item.title && (
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </h4>
                        )}
                        
                        {item.description && (
                          <div className="ql-snow mt-1">
                            <div 
                              className="ql-editor text-xs text-slate-600 dark:text-slate-400 line-clamp-2 p-0"
                              dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditItem(index)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
