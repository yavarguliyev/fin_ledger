export interface FilterOption {
  label: string;
  value: string;
}

export interface ActionIconsConfig {
  view?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface HeaderAction {
  label: string;
  link?: string;
  callback?: () => void;
}

export interface ActionConfig<T = unknown> {
  view?: boolean;
  update?: boolean;
  delete?: boolean;
  onView?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: T) => void;
}

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
