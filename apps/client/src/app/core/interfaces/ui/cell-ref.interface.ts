import { TableColumn } from './table-column.interface';

export interface CellRefDto<T = unknown> {
  row: T;
  column: TableColumn<T>;
}
