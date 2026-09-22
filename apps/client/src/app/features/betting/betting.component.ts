import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
import { ShowMoreConfig } from '../../core/interfaces/ui/show-more-config.interface';
import { Bet } from '../../core/interfaces/betting/bet.interface';
import { GameEvent } from '../../core/interfaces/betting/game-event.interface';
import { ValidatorsHelper } from '../../core/helpers/forms/validators.helper';
import { CurrencyHelper } from '../../core/helpers/wallet/currency.helper';

@Component({
  selector: 'app-betting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyFormatPipe, RelativeTimePipe, PaginationComponent, ShowMoreComponent, PageHeaderComponent],
  templateUrl: './templates/betting.component.html'
})
export class BettingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bettingService = inject(BettingService);
  private readonly toast = inject(ToastService);

  readonly selectedEvent = signal<GameEvent | null>(null);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly eventsPage = signal(1);
  readonly eventsPageSize = signal(5);
  readonly stakeValue = signal<number | null>(null);

  readonly events = computed(() => this.bettingService.events());
  readonly bets = computed(() => this.bettingService.bets());
  readonly availableBalance = computed(() => this.bettingService.availableBalance());
  readonly currency = computed(() => this.bettingService.currency());

  readonly form = this.fb.group({
    stake: this.fb.control<number | null>(null, { validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinValidator(1)], nonNullable: false })
  });

  readonly stakeMinor = computed(() => {
    const value = this.stakeValue();
    return value && value > 0 ? CurrencyHelper.toMinor(value, this.currency()) : 0;
  });

  readonly potentialWin = computed(() => {
    const ev = this.selectedEvent();
    return ev ? Math.round(this.stakeMinor() * ev.odds) : 0;
  });

  readonly canPlaceBet = computed(() => {
    const event = this.selectedEvent();
    const value = this.stakeValue();
    const isLoading = this.loading();
    return event !== null && value !== null && value > 0 && !isLoading;
  });

  readonly visibleEvents = computed(() => {
    const allEvents = this.events();
    const limit = this.eventsPage() * this.eventsPageSize();
    return allEvents.slice(0, limit);
  });

  readonly showMoreConfig = computed<ShowMoreConfig>(() => ({
    pageSize: this.eventsPageSize(),
    currentPage: this.eventsPage(),
    totalItems: this.events().length
  }));

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.bettingService.totalBets(),
    availablePageSizes: [10, 25, 50, 100]
  }));

  constructor () {
    this.form.controls.stake.valueChanges.subscribe(value => this.stakeValue.set(value));
  }

  selectEvent = (event: GameEvent): void => this.selectedEvent.set(event);
  loadMoreEvents = (): void => this.eventsPage.update(page => page + 1);

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
    this.bettingService.loadEvents().subscribe();
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
    this.bettingService.placeBet(event, stake).subscribe({
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

  private announce (bet: Bet): void {
    if (bet.status === 'WON') return this.toast.success(`Bet won! You collected ${CurrencyHelper.formatCurrency(bet.payoutMinor ?? 0, bet.currency)}.`);
    if (bet.status === 'LOST') return this.toast.info('Bet placed — no luck this time.');

    return this.toast.success('Bet placed!');
  }

  private loadBets (): void {
    this.bettingService.loadBets(this.currentPage(), this.pageSize()).subscribe();
  }
}
