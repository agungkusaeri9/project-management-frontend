'use client';

import { useState } from 'react';
import { SubFeature } from '../services/sub-feature.service';
import { useSubFeatures, useCreateSubFeature, useUpdateSubFeature, useDeleteSubFeature } from '../hooks/use-sub-features';
import { Loader2, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface SubFeatureListProps {
  featureId: string;
}

export function SubFeatureList({ featureId }: SubFeatureListProps) {
  const { data: subFeatures = [], isLoading } = useSubFeatures(featureId);
  const { mutate: createSubFeature, isPending: isCreating } = useCreateSubFeature();
  const { mutate: updateSubFeature, isPending: isUpdating } = useUpdateSubFeature();
  const { mutate: deleteSubFeature, isPending: isDeleting } = useDeleteSubFeature();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createSubFeature(
      { feature_id: featureId, name: newName.trim(), sort_order: subFeatures.length + 1, status: 'new' },
      {
        onSuccess: () => {
          toast.success('Sub-feature added');
          setNewName(''); // Keep input open
        },
        onError: () => toast.error('Failed to add sub-feature'),
      }
    );
  };

  const handleUpdate = (id: string, subFeature: SubFeature) => {
    if (!editName.trim()) return;
    updateSubFeature(
      { id, data: { ...subFeature, name: editName.trim() } },
      {
        onSuccess: () => {
          toast.success('Sub-feature updated');
          setEditingId(null);
        },
        onError: () => toast.error('Failed to update sub-feature'),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this sub-feature?')) return;
    deleteSubFeature(
      { id, parentId: featureId },
      {
        onSuccess: () => toast.success('Sub-feature deleted'),
        onError: () => toast.error('Failed to delete sub-feature'),
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
          {subFeatures.map((sf) => (
            <li key={sf.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
              {editingId === sf.id ? (
                <div className="flex-1 flex items-center gap-2 mr-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(sf.id, sf)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate(sf.id, sf)} className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{sf.name}</h3>
                </div>
              )}

              {editingId !== sf.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingId(sf.id); setEditName(sf.name); }}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Edit Sub Feature"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sf.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Sub Feature"
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
                placeholder="Type sub-feature name and press Enter to save..."
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
                Add New Sub Feature
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
