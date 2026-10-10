import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { Transaction } from '../../core/types/wallet/transaction.type';
import { WalletTransactionSummary } from '../../core/interfaces/wallet/wallet-transaction-summary.interface';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCard } from '../../core/interfaces/ui/stat-card.interface';
import { ALL_RECORDS_SCOPE } from '../../core/constants/common/all-records-scope.constant';
import { DashboardHelper } from './helpers/dashboard.helper';
import { GameEventsService } from '../../core/services/game-events.service';
import { GameEvent } from '../../core/interfaces/betting/game-event.interface';
import { SparkSeriesHelper } from './helpers/spark-series.helper';
import { TransactionRowComponent } from '../../shared/components/transaction-row/transaction-row.component';
import { DASHBOARD_LIVE_NOW } from './constants/dashboard-live-now.constant';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';
import { TabsComponent } from '../../shared/components/tabs/tabs.component';
import { TabItemDto } from '../../core/interfaces/ui/tab-item.interface';
import { DASHBOARD_VIEW } from './constants/dashboard-view.constant';
import { BalanceHeroComponent } from '../../shared/components/balance-hero/balance-hero.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, StatsCardComponent, PageHeaderComponent, ErrorStateComponent, TabsComponent, BalanceHeroComponent, TransactionRowComponent],
  templateUrl: './templates/dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);

  private readonly requestedCurrency = signal<string | null>(null);
  private readonly isStaff = this.auth.isStaff;

  private readonly gameEvents = inject(GameEventsService);

  readonly liveBadgeTone = (index: number): string => DASHBOARD_LIVE_NOW.BADGE_TONES[index % DASHBOARD_LIVE_NOW.BADGE_TONES.length] ?? '';
  readonly liveNowView = DASHBOARD_LIVE_NOW;

  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly states = LOAD_STATE;
  readonly activityPlaceholders = Array.from({ length: DASHBOARD_VIEW.ACTIVITY_PLACEHOLDERS }, (_, index) => index);
  readonly wallet = computed(() => this.walletService.wallet());
  readonly summaries = signal<WalletTransactionSummary[]>([]);
  readonly recentTx = signal<Transaction[]>([]);
  readonly title = computed(() => DashboardHelper.greeting({ hour: new Date().getHours(), name: this.auth.currentUser()?.displayName }));
  readonly activityRows = computed(() => this.recentTx().slice(0, DASHBOARD_VIEW.ACTIVITY_ROWS));
  readonly liveNow = signal<GameEvent[]>([]);
  readonly isUser = this.auth.isPlayer;

  readonly currencies = computed(() => this.summaries().map(summary => summary.currency));
  readonly hasMultipleCurrencies = computed(() => this.currencies().length > 1);
  readonly currencyTabs = computed<TabItemDto[]>(() => this.currencies().map(currency => ({ id: currency, label: currency })));
  readonly currencyTabsLabel = DASHBOARD_VIEW.CURRENCY_TABS_LABEL;
  readonly activeCurrency = computed(() => this.selectedCurrency() ?? DASHBOARD_VIEW.NO_CURRENCY);

  readonly selectedCurrency = computed(() => {
    const available = this.currencies();
    const requested = this.requestedCurrency();

    if (requested && available.includes(requested)) return requested;

    const walletCurrency = this.wallet()?.currency;
    if (walletCurrency && available.includes(walletCurrency)) return walletCurrency;

    return available[0] ?? null;
  });

  readonly activeSummary = computed(() => this.summaries().find(entry => entry.currency === this.selectedCurrency()));

  readonly subtitle = computed(() => DashboardHelper.subtitle({ summary: this.activeSummary() }));

  readonly activeStats = computed<StatCard[]>(() => {
    const summary = this.activeSummary();
    const series = SparkSeriesHelper.build({ transactions: this.recentTx(), now: new Date() });
    return summary ? DashboardHelper.buildStatCards({ summary, series }) : [];
  });

  onSelectCurrency (currency: string): void {
    this.requestedCurrency.set(currency);
  }

  ngOnInit (): void {
    this.load();
    this.loadLiveNow();
  }

  load (): void {
    this.loading.set(true);
    this.failed.set(false);

    if (this.isStaff()) this.loadActivity(ALL_RECORDS_SCOPE);
    else {
      this.walletService.ensureWallets().subscribe({
        next: () => {
          const walletId = this.walletService.wallet()?.id;
          if (walletId) this.loadActivity(walletId);
          else this.loading.set(false);
        },
        error: () => this.fail()
      });
    }

  }

  private loadActivity (scope: string): void {
    this.walletService.getOverview({ walletId: scope, page: DASHBOARD_VIEW.HISTORY_PAGE, limit: DASHBOARD_VIEW.HISTORY_LIMIT }).subscribe({
      next: ({ summary, recent }) => {
        this.summaries.set(summary);
        this.recentTx.set(recent.data);
        this.loading.set(false);
      },
      error: () => this.fail()
    });
  }

  private loadLiveNow (): void {
    this.gameEvents.getEvents().subscribe({
      next: events => this.liveNow.set(DashboardHelper.liveNow({ events })),
      error: () => this.liveNow.set([])
    });
  }

  private fail (): void {
    this.loading.set(false);
    this.failed.set(true);
  }
}
