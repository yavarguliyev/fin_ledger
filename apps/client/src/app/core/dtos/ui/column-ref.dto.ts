import { TableColumn } from '../../interfaces/ui/table-column.interface';

export interface ColumnRefDto<T = unknown> {
  column: TableColumn<T>;
}
