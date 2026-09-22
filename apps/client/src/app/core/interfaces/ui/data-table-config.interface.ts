import { FilterOption } from './filter-option.interface';
import { HeaderAction } from './header-action.interface';
import { TableColumn } from './table-column.interface';

export interface DataTableConfig<T = unknown> {
  title: string;
  columns: TableColumn<T>[];
  showFilters?: boolean;
  showExport?: boolean;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  exportLabel?: string;
  emptyMessage?: string;
  mobileCardTemplate?: boolean;
  headerActions?: boolean;
  headerAction?: HeaderAction;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}
