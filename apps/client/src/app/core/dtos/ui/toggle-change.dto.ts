import { TableColumn } from '../../interfaces/ui/table-column.interface';

export interface ToggleChangeDto<T = unknown> {
  row: T;
  column: TableColumn<T>;
  checked: boolean;
}
