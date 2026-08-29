import {
  Layers,
  Network,
  Server,
  FileText,
  ShieldCheck,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  Activity,
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
  'git-branch': GitBranch,
  'alert-circle': AlertCircle,
  'check-circle': CheckCircle2,
  activity: Activity,
};
