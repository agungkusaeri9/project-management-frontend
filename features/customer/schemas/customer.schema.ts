import { z } from 'zod';

export const customerSchema = z.object({
  code: z.string().min(1, 'Customer Code is required').max(255),
  name: z.string().min(1, 'Customer Name is required').max(255),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
