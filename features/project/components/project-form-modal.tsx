'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectFormData } from '../schemas/project.schema';
import { useCreateProject, useUpdateProject } from '../hooks/use-projects';
import { useCustomers } from '../../customer/hooks/use-customers';
import { Project } from '../services/project.service';
import { X, Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export function ProjectFormModal({ isOpen, onClose, projectToEdit }: ProjectFormModalProps) {
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers({ page: 1, limit: 10000, search: '' });
  const customers = customersData?.data || [];

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      status: 'new',
      customer_id: '',
      start_date: '',
      end_date: '',
    },
  });

  useEffect(() => {
    if (projectToEdit) {
      reset({
        code: projectToEdit.code,
        name: projectToEdit.name,
        description: projectToEdit.description || '',
        status: (projectToEdit.status as 'new' | 'ongoing' | 'internal-testing' | 'completed' | 'on-hold') || 'new',
        customer_id: projectToEdit.customer_id || '',
        start_date: projectToEdit.start_date ? projectToEdit.start_date.split('T')[0] : '',
        end_date: projectToEdit.end_date ? projectToEdit.end_date.split('T')[0] : '',
      });
    } else {
      reset({ code: '', name: '', description: '', status: 'new', customer_id: '', start_date: '', end_date: '' });
    }
  }, [projectToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const toISODate = (val: string | null | undefined): string | null => {
    if (!val || val === '') return null;
    // If already RFC3339, return as-is; otherwise append time
    return val.includes('T') ? val : `${val}T00:00:00Z`;
  };

  const onSubmit = (data: ProjectFormData) => {
    const payload = {
      ...data,
      description: data.description ?? null,
      customer_id: !data.customer_id ? null : data.customer_id,
      start_date: toISODate(data.start_date),
      end_date: toISODate(data.end_date),
    };

    if (projectToEdit) {
      updateProject(
        { id: projectToEdit.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Project updated successfully');
            onClose();
          },
          onError: () => {
            toast.error('Failed to update project');
          },
        }
      );
    } else {
      createProject(payload, {
        onSuccess: () => {
          toast.success('Project created successfully');
          onClose();
        },
        onError: () => {
          toast.error('Failed to create project');
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {projectToEdit ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Project Code <span className="text-red-500">*</span>
            </label>
            <input
              {...register('code')}
              placeholder="e.g. PRJ-001"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${
                errors.code ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Website Redesign"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${
                errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-900 dark:text-slate-100"
            >
              <option value="new">New</option>
              <option value="ongoing">Ongoing</option>
              <option value="internal-testing">Internal Testing</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Customer <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              {...register('customer_id')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-900 dark:text-slate-100 disabled:opacity-50"
              disabled={isLoadingCustomers}
            >
              <option value="">-- No Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                {...register('start_date')}
                type="date"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                End Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                {...register('end_date')}
                type="date"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              {...register('description')}
              placeholder="Project description..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-indigo-500/20 transition-all"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
