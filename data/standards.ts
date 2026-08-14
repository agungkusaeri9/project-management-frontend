import {
  Layers,
  Network,
  Server,
  FileText,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { IconKey, StandardCategory } from '@/features/standard';

export { type IconKey, type StandardCategory };

export const iconMap: Record<IconKey, LucideIcon> = {
  layers: Layers,
  network: Network,
  server: Server,
  'file-text': FileText,
  shield: ShieldCheck,
};
