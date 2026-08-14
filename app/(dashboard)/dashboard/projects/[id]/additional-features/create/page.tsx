'use client';

import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, ListPlus, Edit2, User, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/features/project/hooks/use-projects';
import { useCreateAdditionalFeature } from '@/features/additional-feature/hooks/use-additional-features';
import { AdditionalFeature } from '@/features/additional-feature/services/additional-feature.service';
import { useState, useEffect } from 'react';

interface FormValues {
  status: string;
  start_date: string;
  estimated_completion_date: string;
  items: {
    id: string;
    name: string;
    description: string;
    estimated_completion_date: string;
    modules: any[];
  }[];
}

export default function CreateAdditionalFeaturePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { mutate: createFeature, isPending } = useCreateAdditionalFeature(projectId);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      status: 'ongoing',
      start_date: new Date().toISOString().split('T')[0],
      estimated_completion_date: '',
      items: []
    }
  });

  const { fields: itemFields, append: appendItem, remove: removeItem, update: updateItem } = useFieldArray({
    control,
    name: 'items',
    keyName: '_fieldId'
  });

  // Watch items to auto-calculate max estimated completion date
  const items = watch('items');
  useEffect(() => {
    if (items && items.length > 0) {
      const dates = items
        .map(item => item.estimated_completion_date)
        .filter(date => date) // exclude empty
        .map(date => new Date(date).getTime());

      if (dates.length > 0) {
        const maxDate = new Date(Math.max(...dates));
        setValue('estimated_completion_date', maxDate.toISOString().split('T')[0]);
      }
    }
  }, [items, setValue]);

  // State for the item input form
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    estimated_completion_date: ''
  });

  const handleAddItem = () => {
    if (!itemForm.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (editingIndex !== null) {
      updateItem(editingIndex, {
        id: itemFields[editingIndex].id,
        name: itemForm.name,
        description: itemForm.description,
        estimated_completion_date: itemForm.estimated_completion_date,
        modules: []
      });
      setEditingIndex(null);
    } else {
      appendItem({
        id: Math.random().toString(36).substr(2, 9),
        name: itemForm.name,
        description: itemForm.description,
        estimated_completion_date: itemForm.estimated_completion_date,
        modules: []
      });
    }

    // Reset item form
    setItemForm({
      name: '',
      description: '',
      estimated_completion_date: ''
    });
  };

  const handleEditItem = (index: number) => {
    const item = itemFields[index];
    setItemForm({
      name: item.name,
      description: item.description,
      estimated_completion_date: item.estimated_completion_date
    });
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setItemForm({
      name: '',
      description: '',
      estimated_completion_date: ''
    });
  };

  const onSubmit = (data: FormValues) => {
    if (data.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const payload: AdditionalFeature = {
      id: '',
      project_id: projectId,
      status: data.status,
      start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
      estimated_completion_date: data.estimated_completion_date ? new Date(data.estimated_completion_date).toISOString() : undefined,
      items: data.items.map(item => ({
        id: '',
        additional_feature_id: '',
        name: item.name,
        description: item.description || undefined,
        estimated_completion_date: item.estimated_completion_date ? new Date(item.estimated_completion_date).toISOString() : undefined,
        modules: []
      }))
    };

    createFeature(payload, {
      onSuccess: () => {
        toast.success('Additional feature created successfully!');
        router.push(`/dashboard/projects/${projectId}`);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to create additional feature');
      }
    });
  };

  if (isLoadingProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Additional Feature</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add multiple feature items to this project.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Top Header - Full Width */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Project Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Row 1 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project Name
              </label>
              <div className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
                {project?.name || projectId}
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Customer Info
              </span>
              {project ? (
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {project.customer_name || 'No Customer Attached'}
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic">Loading...</div>
              )}
            </div>

            {/* Row 2 */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors appearance-none"
              >
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('start_date', { required: 'Start Date is required' })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
              {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                <span>Est. Completion Date</span>
                <span className="text-slate-400 font-normal group relative">
                  <Clock className="w-4 h-4 cursor-help" />
                  <span className="invisible group-hover:visible absolute right-0 top-6 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-10">
                    Auto-calculated from the maximum item date, but can be manually overridden.
                  </span>
                </span>
              </label>
              <input
                type="date"
                {...register('estimated_completion_date')}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="md:col-span-4 text-sm text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              * The feature code will be automatically generated upon saving.
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Column: Form to Add Item */}
          <div className="w-full lg:w-[35%] space-y-6 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {editingIndex !== null ? 'Edit Feature Item' : 'Add Feature Item'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="e.g. Reporting System"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="Describe the item..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Item Estimated Date
                  </label>
                  <input
                    type="date"
                    value={itemForm.estimated_completion_date}
                    onChange={(e) => setItemForm({ ...itemForm, estimated_completion_date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex-1 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-xl font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {editingIndex !== null ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingIndex !== null ? 'Update Item' : 'Add to List'}
                  </button>
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: List of Items */}
          <div className="flex-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">

              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-indigo-500" />
                  Added Items ({itemFields.length})
                </h2>
              </div>

              <div className="flex-1 p-6">
                {itemFields.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <ListPlus className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No items added to the list.</p>
                    <p className="text-sm text-slate-400 mt-1">Use the form on the left to add items.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {itemFields.map((item, index) => (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-xl flex items-start justify-between gap-4 transition-all ${editingIndex === index
                            ? 'border-indigo-400 bg-indigo-50/30 dark:border-indigo-500/50 dark:bg-indigo-900/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{item.name}</h3>
                          </div>

                          {item.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 ml-7 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {item.estimated_completion_date && (
                            <div className="ml-7 mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-200/50 dark:border-amber-800/50">
                              Est: {item.estimated_completion_date}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditItem(index)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <button
                  type="submit"
                  disabled={isPending || itemFields.length === 0}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save All Items to Project
                </button>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
