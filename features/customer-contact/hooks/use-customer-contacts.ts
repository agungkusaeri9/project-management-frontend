import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  customerContactService,
  CustomerContact,
  CreateCustomerContactPayload,
  UpdateCustomerContactPayload,
} from '../services/customer-contact.service';

export const useCustomerContacts = (customerId?: string, search?: string) => {
  return useQuery({
    queryKey: ['customer-contacts', customerId, search],
    queryFn: () => customerContactService.getAll(customerId, search),
    enabled: true,
  });
};

export const useCreateCustomerContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerContactPayload) => customerContactService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-contacts'] });
      if (variables.customer_id) {
        queryClient.invalidateQueries({ queryKey: ['customer-contacts', variables.customer_id] });
      }
    },
  });
};

export const useUpdateCustomerContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerContactPayload }) =>
      customerContactService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-contacts'] });
    },
  });
};

export const useDeleteCustomerContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerContactService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-contacts'] });
    },
  });
};
