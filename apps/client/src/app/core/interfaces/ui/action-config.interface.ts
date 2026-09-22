export interface ActionConfig<T = unknown> {
  view?: boolean;
  update?: boolean;
  delete?: boolean;
  deleteLabel?: string;
  onView?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: T) => void;
}
