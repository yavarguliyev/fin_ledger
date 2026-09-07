import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaginationConfig } from '../../../core/models/base.mode';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  readonly config = input.required<PaginationConfig>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly totalPages = computed(() => {
    const cfg = this.config();
    return Math.ceil(cfg.totalItems / cfg.pageSize);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.config().currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) pages.push(1, 2, 3, 4, -1, total);
      else if (current >= total - 2) pages.push(1, -1, total - 3, total - 2, total - 1, total);
      else pages.push(1, -1, current - 1, current, current + 1, -1, total);
    }

    return pages;
  });

  goToPage (page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.pageChange.emit(page);
  }

  onPageSizeChange (event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSizeChange.emit(Number(target.value));
  }
}
