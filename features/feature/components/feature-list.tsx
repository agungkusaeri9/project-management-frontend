'use client';

import { useState } from 'react';
import { Feature } from '../services/feature.service';
import { useFeatures, useCreateFeature, useUpdateFeature, useDeleteFeature } from '../hooks/use-features';
import { Loader2, Plus, Edit2, Trash2, Check, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface FeatureListProps {
  moduleId: string;
}

export function FeatureList({ moduleId }: FeatureListProps) {
  const { data: features = [], isLoading } = useFeatures(moduleId);
  const { mutate: createFeature, isPending: isCreating } = useCreateFeature();
  const { mutate: updateFeature, isPending: isUpdating } = useUpdateFeature();
  const { mutate: deleteFeature, isPending: isDeleting } = useDeleteFeature();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createFeature(
      { module_id: moduleId, name: newName.trim(), sort_order: features.length + 1, status: 'new' },
      {
        onSuccess: () => {
          toast.success('Feature added');
          setNewName(''); // Keep input open for multiple additions
        },
        onError: () => toast.error('Failed to add feature'),
      }
    );
  };

  const handleUpdate = (id: string, feature: Feature) => {
    if (!editName.trim()) return;
    updateFeature(
      { id, data: { ...feature, name: editName.trim() } },
      {
        onSuccess: () => {
          toast.success('Feature updated');
          setEditingId(null);
        },
        onError: () => toast.error('Failed to update feature'),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    deleteFeature(
      { id, parentId: moduleId },
      {
        onSuccess: () => toast.success('Feature deleted'),
        onError: () => toast.error('Failed to delete feature'),
      }
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {features.map((feature) => (
            <li key={feature.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
              {editingId === feature.id ? (
                <div className="flex-1 flex items-center gap-2 mr-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(feature.id, feature)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate(feature.id, feature)} className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{feature.name}</h3>
                </div>
              )}

              {editingId !== feature.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/features/${feature.id}/sub-features`}
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                    title="View Sub Features"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => { setEditingId(feature.id); setEditName(feature.name); }}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Edit Feature"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(feature.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          ))}

          {/* Inline Quick Add */}
          {isAdding ? (
            <li className="p-4 bg-indigo-50/30 dark:bg-indigo-500/5 border-l-2 border-indigo-500 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type feature name and press Enter to save..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="flex-1 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
                disabled={isCreating}
              />
              <button 
                onClick={handleCreate} 
                disabled={!newName.trim() || isCreating}
                className="p-1.5 text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 rounded-md disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => { setIsAdding(false); setNewName(''); }} 
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ) : (
            <li className="p-4">
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Feature
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
