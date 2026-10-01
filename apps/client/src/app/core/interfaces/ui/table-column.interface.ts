import { ActionConfig } from './action-config.interface';
import { CellFormatDto } from '../../dtos/ui/cell-format.dto';
import { RowRefDto } from '../../dtos/ui/row-ref.dto';
import { ToggleValueDto } from '../../dtos/ui/toggle-value.dto';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'custom' | 'toggle' | 'actions';
  align?: 'left' | 'right' | 'center';
  width?: string;
  sortable?: boolean;
  cellClass?: string;
  visible?: boolean;
  mobileVisible?: boolean;
  actions?: ActionConfig<T>;

  format?: (dto: CellFormatDto<T>) => string;
  badgeClass?: (dto: CellFormatDto<T>) => string;
  toggleCallback?: (dto: ToggleValueDto<T>) => void;
  getToggleValue?: (dto: RowRefDto<T>) => boolean;
  toggleDisabled?: (dto: RowRefDto<T>) => boolean;
}
