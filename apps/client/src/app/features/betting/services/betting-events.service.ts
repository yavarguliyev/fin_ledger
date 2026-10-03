import { Injectable, computed, inject, signal } from '@angular/core';

import { BettingService } from '../../../core/services/betting.service';
import { LOAD_STATUS } from '../../../core/constants/ui/load-status.constant';
import { LoadStatus } from '../../../core/types/ui/load-status.type';
import { ShowMoreConfig } from '../../../core/interfaces/ui/show-more-config.interface';

@Injectable()
export class BettingEventsService {
  private readonly bettingService = inject(BettingService);
  private readonly page = signal(1);
  private readonly pageSize = signal(5);

  readonly status = signal<LoadStatus>(LOAD_STATUS.LOADING);
  readonly events = computed(() => this.bettingService.events());
  readonly visible = computed(() => this.events().slice(0, this.page() * this.pageSize()));

  readonly showMoreConfig = computed<ShowMoreConfig>(() => ({
    pageSize: this.pageSize(),
    currentPage: this.page(),
    totalItems: this.events().length
  }));

  load (): void {
    this.status.set(LOAD_STATUS.LOADING);
    this.bettingService.loadEvents().subscribe({
      next: () => this.status.set(LOAD_STATUS.READY),
      error: () => this.status.set(LOAD_STATUS.ERROR)
    });
  }

  loadMore (): void {
    this.page.update(page => page + 1);
  }
}
