import { z } from 'zod';

export const projectSchema = z.object({
  code: z.string().min(1, 'Project Code is required').max(255),
  name: z.string().min(1, 'Project Name is required').max(255),
  description: z.string().nullable().optional(),
  status: z.enum(['new', 'ongoing', 'completed', 'on-hold']),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  customer_id: z.string().nullable().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
