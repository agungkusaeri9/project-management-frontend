import { z } from 'zod';

export const moduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  sort_order: z.number().optional(),
  project_id: z.string(),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;
