import { z } from 'zod';

export const subFeatureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.string().optional(), sort_order: z.number().optional(),
  feature_id: z.string(),
});

export type SubFeatureFormData = z.infer<typeof subFeatureSchema>;
