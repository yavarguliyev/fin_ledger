import { TableColumn } from '../../interfaces/ui/table-column.interface';

export interface CellRefDto<T = unknown> {
  row: T;
  column: TableColumn<T>;
}
