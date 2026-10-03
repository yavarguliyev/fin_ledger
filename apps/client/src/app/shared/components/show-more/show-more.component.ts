import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShowMoreConfig } from '../../../core/interfaces/ui/show-more-config.interface';

@Component({
  selector: 'app-show-more',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './show-more.component.html'
})
export class ShowMoreComponent {
  readonly config = input.required<ShowMoreConfig>();
  readonly loadMore = output<void>();

  readonly hasMore = computed(() => {
    const cfg = this.config();
    const shown = cfg.currentPage * cfg.pageSize;
    return cfg.totalItems > shown;
  });

  readonly shownCount = computed(() => {
    const cfg = this.config();
    const shown = cfg.currentPage * cfg.pageSize;
    return Math.min(shown, cfg.totalItems);
  });

  onLoadMore (): void {
    this.loadMore.emit();
  }
}
