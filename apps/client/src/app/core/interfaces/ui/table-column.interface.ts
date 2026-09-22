import { ActionConfig } from './action-config.interface';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'custom' | 'toggle' | 'actions';
  align?: 'left' | 'right' | 'center';
  width?: string;
  sortable?: boolean;
  format?: (value: unknown, row: T) => string;
  badgeClass?: (value: unknown, row: T) => string;
  cellClass?: string;
  visible?: boolean;
  mobileVisible?: boolean;
  toggleCallback?: (value: boolean, row: T) => void;
  getToggleValue?: (row: T) => boolean;
  actions?: ActionConfig<T>;
}
