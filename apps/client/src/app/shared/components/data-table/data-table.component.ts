import { Component, input, output, computed, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PaginationComponent } from '../pagination/pagination.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { ActionIconsComponent } from '../action-icons/action-icons';
import { PaginationConfig } from '../../../core/models/base.mode';
import { ActionIconsConfig, DataTableConfig, TableColumn } from '../../../core/models/data-table.model';
import { getCellValue, formatCellValue, getBadgeClass, getAlignmentClass, getToggleChecked, getActionConfig } from './data-table.util';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, ToggleComponent, ActionIconsComponent],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent<T = unknown> {
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

  onToggleChange (column: TableColumn<T>, row: T, checked: boolean): void {
    if (column.toggleCallback) column.toggleCallback(checked, row);
  }

  onActionView (column: TableColumn<T>, row: T): void {
    if (column.actions?.onView) column.actions.onView(row);
  }

  onActionUpdate (column: TableColumn<T>, row: T): void {
    if (column.actions?.onUpdate) column.actions.onUpdate(row);
  }

  onActionDelete (column: TableColumn<T>, row: T): void {
    if (column.actions?.onDelete) column.actions.onDelete(row);
  }

  getCellValue (row: T, column: TableColumn<T>): unknown {
    return getCellValue(row, column);
  }

  formatCellValue (value: unknown, row: T, column: TableColumn<T>): string {
    return formatCellValue(value, row, column);
  }

  getBadgeClass (value: unknown, row: T, column: TableColumn<T>): string {
    return getBadgeClass(value, row, column);
  }

  getAlignmentClass (column: TableColumn<T>): string {
    return getAlignmentClass(column);
  }

  getToggleChecked (column: TableColumn<T>, row: T): boolean {
    return getToggleChecked(column, row);
  }

  getActionConfig (column: TableColumn<T>): ActionIconsConfig {
    return getActionConfig(column);
  }

  onFilterChange (event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterChange.emit(target.value);
  }
}
