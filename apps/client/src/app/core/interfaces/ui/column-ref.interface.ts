import { TableColumn } from './table-column.interface';

export interface ColumnRefDto<T = unknown> {
  column: TableColumn<T>;
}
