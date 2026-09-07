import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { BettingService } from '../../core/services/betting.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaginationConfig } from '../../core/models/base.mode';
import { ShowMoreComponent } from '../../shared/components/show-more/show-more.component';
import { ShowMoreConfig } from '../../core/models/base.mode';
import { GameEvent } from '../../core/models/wallet.model';
import { createRequiredValidator, createMinValidator } from '../../core/utils/validators.util';

@Component({
  selector: 'app-betting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyFormatPipe, RelativeTimePipe, PaginationComponent, ShowMoreComponent, PageHeaderComponent],
  templateUrl: './templates/betting.component.html'
})
export class BettingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
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
    stake: this.fb.control<number | null>(null, { validators: [createRequiredValidator(), createMinValidator(1)], nonNullable: false })
  });

  readonly stakeMinor = computed(() => {
    const value = this.stakeValue();
    return value && value > 0 ? Math.round(value * 100) : 0;
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
    const walletId = this.auth.currentUser()?.walletId;
    if (walletId) this.loadBets(walletId);
  }

  onPageSizeChange (size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    const walletId = this.auth.currentUser()?.walletId;
    if (walletId) this.loadBets(walletId);
  }

  ngOnInit (): void {
    const walletId = this.auth.currentUser()?.walletId;
    this.bettingService.loadEvents().subscribe();

    if (walletId) {
      this.bettingService.loadWalletBalance(walletId).subscribe();
      this.loadBets(walletId);
    }
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
      next: () => {
        const walletId = this.auth.currentUser()?.walletId;
        if (walletId) this.loadBets(walletId);

        this.toast.success('Bet placed!');
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

  private loadBets (walletId: string): void {
    this.bettingService.loadBets(walletId, this.currentPage(), this.pageSize()).subscribe();
  }
}
