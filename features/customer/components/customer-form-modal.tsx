'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormData } from '../schemas/customer.schema';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/use-customers';
import { Customer } from '../services/customer.service';
import { X, Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export function CustomerFormModal({ isOpen, onClose, customerToEdit }: CustomerFormModalProps) {
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: '',
      name: '',
    },
  });

  useEffect(() => {
    if (customerToEdit) {
      reset({
        code: customerToEdit.code,
        name: customerToEdit.name,
      });
    } else {
      reset({ code: '', name: '' });
    }
  }, [customerToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: CustomerFormData) => {
    if (customerToEdit) {
      updateCustomer(
        { id: customerToEdit.id, data },
        {
          onSuccess: () => {
            toast.success('Customer updated successfully');
            onClose();
          },
          onError: () => {
            toast.error('Failed to update customer');
          },
        }
      );
    } else {
      createCustomer(data, {
        onSuccess: () => {
          toast.success('Customer created successfully');
          onClose();
        },
        onError: () => {
          toast.error('Failed to create customer');
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {customerToEdit ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Customer Code
            </label>
            <input
              {...register('code')}
              placeholder="e.g. CUST-001"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${
                errors.code ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Customer Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Acme Corporation"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${
                errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
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
              {customerToEdit ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
