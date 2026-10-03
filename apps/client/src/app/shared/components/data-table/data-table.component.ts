import { Component, ChangeDetectionStrategy, input, output, computed, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PaginationComponent } from '../pagination/pagination.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { ActionIconsComponent } from '../action-icons/action-icons';
import { PaginationConfig } from '../../../core/interfaces/ui/pagination-config.interface';
import { ActionIconsConfig } from '../../../core/interfaces/ui/action-icons-config.interface';
import { DataTableConfig } from '../../../core/interfaces/ui/data-table-config.interface';
import { TableColumn } from '../../../core/interfaces/ui/table-column.interface';
import { SELECT_CHEVRON } from '../../../core/constants/ui/select.constant';
import { CellRefDto } from '../../../core/interfaces/ui/cell-ref.interface';
import { ColumnRefDto } from '../../../core/interfaces/ui/column-ref.interface';
import { ToggleChangeDto } from '../../../core/interfaces/ui/toggle-change.interface';
import { DataTableHelper } from './helpers/data-table.helper';

@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, PaginationComponent, ToggleComponent, ActionIconsComponent],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent<T = unknown> {
  readonly CHEVRON_ICON = SELECT_CHEVRON;

  readonly config = input.required<DataTableConfig<T>>();
  readonly data = input.required<T[]>();
  readonly loading = input<boolean>(false);
  readonly paginationConfig = input<PaginationConfig | null>(null);
  readonly selectedFilter = input<string>('ALL');
  readonly customCellTemplate = input<TemplateRef<{ row: T; column: TableColumn<T> }> | null>(null);
  readonly customMobileTemplate = input<TemplateRef<{ row: T }> | null>(null);

  readonly filterChange = output<string>();
  readonly exportClick = output<void>();
  readonly rowClick = output<T>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly createClick = output<void>();

  readonly visibleColumns = computed(() => this.config().columns.filter(col => col.visible !== false));
  readonly mobileColumns = computed(() => this.visibleColumns().filter(col => col.mobileVisible !== false));

  readonly paginatedData = computed(() => {
    const cfg = this.paginationConfig();
    const allData = this.data();
    if (!cfg) return allData;
    const start = (cfg.currentPage - 1) * cfg.pageSize;
    const end = start + cfg.pageSize;
    return allData.slice(start, end);
  });

  onExportClick (): void {
    this.exportClick.emit();
  }

  onRowClick (row: T): void {
    this.rowClick.emit(row);
  }

  onPageChangeHandler (page: number): void {
    this.pageChange.emit(page);
  }

  onPageSizeChangeHandler (size: number): void {
    this.pageSizeChange.emit(size);
  }

  onToggleChange ({ row, column, checked }: ToggleChangeDto<T>): void {
    if (column.toggleCallback) column.toggleCallback({ value: checked, row });
  }

  onActionView ({ row, column }: CellRefDto<T>): void {
    if (column.actions?.onView) column.actions.onView({ row });
  }

  onActionUpdate ({ row, column }: CellRefDto<T>): void {
    if (column.actions?.onUpdate) column.actions.onUpdate({ row });
  }

  onActionDelete ({ row, column }: CellRefDto<T>): void {
    if (column.actions?.onDelete) column.actions.onDelete({ row });
  }

  getCellText (dto: CellRefDto<T>): string {
    return DataTableHelper.getCellText(dto);
  }

  getBadgeClass (dto: CellRefDto<T>): string {
    return DataTableHelper.getBadgeClass(dto);
  }

  getAlignmentClass (dto: ColumnRefDto<T>): string {
    return DataTableHelper.getAlignmentClass(dto);
  }

  getToggleChecked (dto: CellRefDto<T>): boolean {
    return DataTableHelper.getToggleChecked(dto);
  }

  getToggleDisabled (dto: CellRefDto<T>): boolean {
    return DataTableHelper.getToggleDisabled(dto);
  }

  getActionConfig (dto: ColumnRefDto<T>): ActionIconsConfig {
    return DataTableHelper.getActionConfig(dto);
  }

  onFilterChange (event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterChange.emit(target.value);
  }
}
