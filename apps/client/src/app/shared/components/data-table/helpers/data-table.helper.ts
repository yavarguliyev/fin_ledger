import { ActionIconsConfig } from '../../../../core/interfaces/ui/action-icons-config.interface';
import { TableColumn } from '../../../../core/interfaces/ui/table-column.interface';

export class DataTableHelper {
  static getAlignmentClass<T> (column: TableColumn<T>): string {
    return `text-${column.align ?? 'left'}`;
  }

  static getBadgeClass<T> (value: unknown, row: T, column: TableColumn<T>): string {
    if (column.badgeClass) return column.badgeClass(value, row);
    if (typeof value === 'string') return DataTableHelper.getDefaultBadgeClass(value);
    return DataTableHelper.getDefaultBadgeClass('');
  }

  static getToggleChecked<T> (column: TableColumn<T>, row: T): boolean {
    if (column.getToggleValue) return column.getToggleValue(row);
    const value = DataTableHelper.getCellValue(row, column);
    return value === 'active' || value === 'ACTIVE' || value === true;
  }

  static getToggleDisabled<T> (column: TableColumn<T>, row: T): boolean {
    return column.toggleDisabled ? column.toggleDisabled(row) : false;
  }

  static getActionConfig<T> (column: TableColumn<T>): ActionIconsConfig {
    return {
      view: column.actions?.view ?? false,
      update: column.actions?.update ?? false,
      delete: column.actions?.delete ?? false,
      deleteLabel: column.actions?.deleteLabel ?? 'Delete'
    };
  }

  static formatCellValue<T> (value: unknown, row: T, column: TableColumn<T>): string {
    if (column.format) return column.format(value, row);
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    return '—';
  }

  static getCellValue<T> (row: T, column: TableColumn<T>): unknown {
    const keys = column.key.split('.');
    let value: unknown = row;

    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
    }

    return value;
  }

  static getDefaultBadgeClass (status: string): string {
    const map: Record<string, string> = {
      active: 'bg-success/10 text-success',
      suspended: 'bg-warning/10 text-warning',
      closed: 'bg-danger/10 text-danger',
      inactive: 'bg-ink-100 dark:bg-night-border text-ink-500 dark:text-ink-400',
      COMPLETED: 'bg-success/10 text-success',
      PENDING: 'bg-warning/10 text-warning',
      FAILED: 'bg-danger/10 text-danger',
      CANCELLED: 'bg-ink-100 text-ink-500'
    };

    return map[status] ?? 'bg-ink-100 dark:bg-night-border text-ink-500 dark:text-ink-400';
  }
}
