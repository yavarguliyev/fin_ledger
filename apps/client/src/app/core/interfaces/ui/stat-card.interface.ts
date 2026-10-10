import { IconName } from '../../types/ui/icon-name.type';
import { StatChoice } from './stat-choice.interface';

export interface StatCard {
  label: string;
  value: string;
  icon: IconName;
  trend?: string;
  toneClass?: string;
  choices?: StatChoice[];
}
