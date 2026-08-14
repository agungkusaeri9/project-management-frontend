'use client';

import { useState } from 'react';
import { CustomerTable } from '@/features/customer/components/customer-table';
import { CustomerFormModal } from '@/features/customer/components/customer-form-modal';
import { Customer } from '@/features/customer/services/customer.service';
import { Plus } from 'lucide-react';

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const handleEdit = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Customers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your customer database and records
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>
      
      <CustomerTable onEdit={handleEdit} />

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customerToEdit={customerToEdit}
      />
    </div>
  );
}
