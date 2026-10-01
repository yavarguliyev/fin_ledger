import { ActionIconsConfig } from '../../../../core/interfaces/ui/action-icons-config.interface';
import { TABLE } from '../../../../core/constants/ui/table.constant';
import { BADGE_CLASSES } from '../../../../core/constants/ui/badge-class.constant';
import { BadgeStatusDto } from '../../../../core/dtos/ui/badge-status.dto';
import { CellRefDto } from '../../../../core/dtos/ui/cell-ref.dto';
import { ColumnRefDto } from '../../../../core/dtos/ui/column-ref.dto';

export class DataTableHelper {
  static getAlignmentClass<T> ({ column }: ColumnRefDto<T>): string {
    return `${TABLE.ALIGN_PREFIX}${column.align ?? TABLE.DEFAULT_ALIGN}`;
  }

  static getDefaultBadgeClass ({ status }: BadgeStatusDto): string {
    return BADGE_CLASSES[status] ?? TABLE.DEFAULT_BADGE_CLASS;
  }

  static getToggleDisabled<T> ({ row, column }: CellRefDto<T>): boolean {
    return column.toggleDisabled ? column.toggleDisabled({ row }) : false;
  }

  static getBadgeClass<T> ({ row, column }: CellRefDto<T>): string {
    const value = DataTableHelper.getCellValue({ row, column });
    if (column.badgeClass) return column.badgeClass({ value, row });
    return DataTableHelper.getDefaultBadgeClass({ status: typeof value === 'string' ? value : '' });
  }

  static getToggleChecked<T> ({ row, column }: CellRefDto<T>): boolean {
    if (column.getToggleValue) return column.getToggleValue({ row });
    const value = DataTableHelper.getCellValue({ row, column });
    return value === true || TABLE.ACTIVE_VALUES.some(active => active === value);
  }

  static getActionConfig<T> ({ column }: ColumnRefDto<T>): ActionIconsConfig {
    return {
      view: column.actions?.view ?? false,
      update: column.actions?.update ?? false,
      delete: column.actions?.delete ?? false,
      deleteLabel: column.actions?.deleteLabel ?? TABLE.DEFAULT_DELETE_LABEL
    };
  }

  static getCellText<T> ({ row, column }: CellRefDto<T>): string {
    const value = DataTableHelper.getCellValue({ row, column });
    if (column.format) return column.format({ value, row });
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    return TABLE.EMPTY_CELL;
  }

  static getCellValue<T> ({ row, column }: CellRefDto<T>): unknown {
    let value: unknown = row;

    for (const key of column.key.split('.')) {
      value = (value as Record<string, unknown>)?.[key];
    }

    return value;
  }
}
