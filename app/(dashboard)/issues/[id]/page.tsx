'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import 'react-quill-new/dist/quill.snow.css';
import { format } from 'date-fns';
import {
  ArrowLeft, Calendar, Hash, Info, Building2, Briefcase,
  Loader2, Edit2, ShieldAlert, FolderOpen, Box, GitBranch, Save, ListChecks, X
} from 'lucide-react';
import { useIssue, useUpdateIssue, useUpdateIssueItemStatus } from '../../../../features/issue/hooks/use-issues';
import { useProjects } from '../../../../features/project/hooks/use-projects';
import { useModules } from '../../../../features/module/hooks/use-modules';
import { useFeatures } from '../../../../features/feature/hooks/use-features';
import { useSubFeatures } from '../../../../features/subfeature/hooks/use-sub-features';
import { IssueFormModal } from '../../../../features/issue/components/issue-form-modal';
import { toast } from 'sonner';

const statusStyle = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'resolved':
    case 'closed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    default:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }
};

const priorityStyle = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-semibold';
    case 'high':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedItemDescription, setSelectedItemDescription] = useState<string | null>(null);

  const closeDescriptionModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsDescriptionModalOpen(false);
      setIsClosing(false);
      setSelectedItemDescription(null);
    }, 200);
  };

  const { data: issue, isLoading, isError } = useIssue(issueId);
  const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue();
  const { mutate: updateItemStatus } = useUpdateIssueItemStatus();

  // Cascading dropdown states
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('');
  const [selectedSubFeatureId, setSelectedSubFeatureId] = useState<string>('');

  const { data: projects = [] } = useProjects();
  const { data: modules = [] } = useModules(selectedProjectId);
  const { data: features = [] } = useFeatures(selectedModuleId);
  const { data: subFeatures = [] } = useSubFeatures(selectedFeatureId);

  useEffect(() => {
    if (issue) {
      setSelectedProjectId(issue.project_id || '');
      setSelectedModuleId(issue.module_id || '');
      setSelectedFeatureId(issue.feature_id || '');
      setSelectedSubFeatureId(issue.sub_feature_id || '');
    }
  }, [issue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="text-center py-20 text-slate-500">
        Issue not found.
      </div>
    );
  }

  const handleSaveAssociation = () => {
    const payload = {
      ...issue,
      project_id: selectedProjectId || null,
      module_id: selectedModuleId || null,
      feature_id: selectedFeatureId || null,
      sub_feature_id: selectedSubFeatureId || null,
    };

    updateIssue(
      { id: issue.id, data: payload },
      {
        onSuccess: () => {
          toast.success('Module/Feature association updated successfully');
        },
        onError: () => {
          toast.error('Failed to update association');
        },
      }
    );
  };

  const hasItems = issue.items && issue.items.length > 0;

  return (
    <>
      {/* Description Modal */}
      {isDescriptionModalOpen && selectedItemDescription && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm duration-200 ${isClosing ? 'animate-out fade-out' : 'animate-in fade-in'}`}>
          <div className={`bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden duration-200 ${isClosing ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95'}`}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-500" />
                Item Description
              </h2>
              <button onClick={closeDescriptionModal} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto overflow-x-hidden">
              <div className="ql-snow">
                <div 
                  className="ql-editor text-sm text-slate-700 dark:text-slate-300 break-words whitespace-pre-wrap max-w-none p-0"
                  dangerouslySetInnerHTML={{ __html: selectedItemDescription }}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button onClick={closeDescriptionModal} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <IssueFormModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          issueToEdit={issue}
        />

      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/issues')}
          className="p-2 -ml-2 mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
              {issue.issue_code}
            </h1>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${statusStyle(
                issue.status
              )}`}
            >
              {issue.status.replace('_', ' ')}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs uppercase tracking-wider ${priorityStyle(
                issue.priority
              )}`}
            >
              {issue.priority} priority
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
        >
          <Edit2 className="w-4 h-4" />
          Edit Issue
        </button>
      </div>

      {/* Issue Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Issue Information
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                  <Hash className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Issue Code
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {issue.issue_code}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Priority
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 capitalize">
                    {issue.priority}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Issue Date
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {issue.issue_date
                      ? format(new Date(issue.issue_date), 'dd MMM yyyy')
                      : '—'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Created At
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {issue.created_at
                      ? format(new Date(issue.created_at), 'dd MMM yyyy HH:mm')
                      : '—'}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Dynamic Issue Items List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-500" />
                Issue Items ({hasItems ? issue.items!.length : 0})
              </h2>
            </div>

            {!hasItems ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                No items recorded for this issue.
              </div>
            ) : (
              <div className="space-y-4">
                {issue.items!.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Item #{index + 1}
                      </span>
                      <select
                        value={item.status || 'open'}
                        onChange={(e) => {
                          if (item.id) {
                            updateItemStatus({
                              issueId,
                              itemId: item.id,
                              status: e.target.value
                            }, {
                              onSuccess: () => toast.success('Item status updated')
                            });
                          }
                        }}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                          item.status === 'resolved' || item.status === 'closed' ? 'text-emerald-600 dark:text-emerald-400' :
                          item.status === 'in_progress' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {item.module_name ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 rounded-lg font-medium">
                          <FolderOpen className="w-3.5 h-3.5" />
                          {item.module_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No module</span>
                      )}

                      {item.feature_name && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">/</span>
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg font-medium">
                            <Box className="w-3.5 h-3.5" />
                            {item.feature_name}
                          </span>
                        </>
                      )}

                      {item.sub_feature_name && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">/</span>
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 rounded-lg font-medium">
                            <GitBranch className="w-3.5 h-3.5" />
                            {item.sub_feature_name}
                          </span>
                        </>
                      )}
                    </div>

                    {item.title && (
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">
                        {item.title}
                      </h4>
                    )}
                    {item.description && (
                      <div className="mt-1">
                        <button
                          onClick={() => {
                            setSelectedItemDescription(item.description!);
                            setIsDescriptionModalOpen(true);
                          }}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Show Description
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project & Customer Details Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Project Context
            </h2>

            <div className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Assigned Project
                </dt>
                <dd className="mt-1">
                  {issue.project_id ? (
                    <Link
                      href={`/projects/${issue.project_id}`}
                      className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                    >
                      <Briefcase className="w-4 h-4" />
                      {issue.project_name || 'View Project'}
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-400">No project assigned</span>
                  )}
                </dd>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Customer
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {issue.customer_name || '—'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
