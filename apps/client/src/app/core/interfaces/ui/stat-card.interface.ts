import { IconName } from '../../types/ui/icon-name.type';
import { StatChoice } from './stat-choice.interface';

export interface StatCard {
  label: string;
  value: string;
  icon: IconName;
  trend?: string;
  toneClass?: string;
  spark?: number[];
  sparkClass?: string;
  choices?: StatChoice[];
}
