import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { BettingService } from '../../core/services/betting.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationConfig } from '../../core/interfaces/ui/pagination-config.interface';
import { ShowMoreComponent } from '../../shared/components/show-more/show-more.component';
import { Bet } from '../../core/types/betting/bet.type';
import { GameEvent } from '../../core/interfaces/betting/game-event.interface';
import { ValidatorsHelper } from '../../core/helpers/forms/validators.helper';
import { CurrencyHelper } from '../../core/helpers/wallet/currency.helper';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LOAD_STATUS } from '../../core/constants/ui/load-status.constant';
import { BettingEventsService } from './services/betting-events.service';
import { ConnectivityService } from '../../core/services/connectivity.service';

@Component({
  selector: 'app-betting',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyFormatPipe, RelativeTimePipe, PaginationComponent, ShowMoreComponent, PageHeaderComponent, SkeletonComponent, EmptyStateComponent, ErrorStateComponent],
  providers: [BettingEventsService],
  templateUrl: './templates/betting.component.html'
})
export class BettingComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly connectivity = inject(ConnectivityService);
  private readonly fb = inject(FormBuilder);
  private readonly bettingService = inject(BettingService);
  private readonly toast = inject(ToastService);

  readonly selectedEvent = signal<GameEvent | null>(null);
  readonly loading = signal(false);
  readonly eventsList = inject(BettingEventsService);
  readonly statuses = LOAD_STATUS;
  readonly states = LOAD_STATE;
  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly stakeValue = signal<number | null>(null);

  readonly bets = computed(() => this.bettingService.bets());
  readonly availableBalance = computed(() => this.bettingService.availableBalance());
  readonly currency = computed(() => this.bettingService.currency());

  readonly form = this.fb.group({
    stake: this.fb.control<number | null>(null, {
      validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinValidator(1)],
      nonNullable: false
    })
  });

  readonly stakeMinor = computed(() => {
    const value = this.stakeValue();
    return value && value > 0 ? CurrencyHelper.toMinor({ amount: value, currency: this.currency() }) : 0;
  });

  readonly potentialWin = computed(() => {
    const ev = this.selectedEvent();
    return ev ? Math.round(this.stakeMinor() * ev.odds) : 0;
  });

  readonly canPlaceBet = computed(() => {
    const value = this.stakeValue();
    return this.selectedEvent() !== null && value !== null && value > 0 && !this.loading() && !this.connectivity.offline();
  });

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.bettingService.totalBets(),
    availablePageSizes: [10, 25, 50, 100]
  }));

  constructor () {
    this.form.controls.stake.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => this.stakeValue.set(value));
  }

  selectEvent = (event: GameEvent): void => this.selectedEvent.set(event);

  onPageChange (page: number): void {
    this.currentPage.set(page);
    this.loadBets();
  }

  onPageSizeChange (size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadBets();
  }

  ngOnInit (): void {
    this.eventsList.load();
    this.bettingService.loadWallets().subscribe();
    this.loadBets();
  }

  placeBet (): void {
    const event = this.selectedEvent();
    const stake = this.stakeMinor();

    if (!event || !this.form.valid || stake <= 0) {
      this.toast.error('Please enter a valid stake amount');
      return;
    }

    this.loading.set(true);
    this.bettingService.placeBet({ event, stakeMinor: stake }).subscribe({
      next: settled => {
        this.loadBets();
        this.announce(settled);
        this.form.reset();
        this.selectedEvent.set(null);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.loading.set(false);
      }
    });
  }

  private loadBets (): void {
    this.bettingService.loadBets({ page: this.currentPage(), limit: this.pageSize() }).subscribe();
  }

  private announce (bet: Bet): void {
    if (bet.status === 'WON') {
      return this.toast.success(
        `Bet won! You collected ${CurrencyHelper.formatCurrency({ amountMinor: bet.payoutMinor ?? 0, currency: bet.currency })}.`
      );
    }

    if (bet.status === 'LOST') return this.toast.info('Bet placed — no luck this time.');
    return this.toast.success('Bet placed!');
  }
}
