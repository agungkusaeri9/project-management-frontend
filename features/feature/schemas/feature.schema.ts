import { z } from 'zod';

export const featureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.string().optional(), sort_order: z.number().optional(),
  module_id: z.string(),
});

export type FeatureFormData = z.infer<typeof featureSchema>;
