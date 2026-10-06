import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { Transaction } from '../../core/types/wallet/transaction.type';
import { WalletTransactionSummary } from '../../core/interfaces/wallet/wallet-transaction-summary.interface';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableConfig } from '../../core/interfaces/ui/data-table-config.interface';
import { StatCard } from '../../core/interfaces/ui/stat-card.interface';
import { TableColumn } from '../../core/interfaces/ui/table-column.interface';
import { ALL_RECORDS_SCOPE } from '../../core/constants/common/all-records-scope.constant';
import { TransactionHelper } from '../../core/helpers/wallet/transaction.helper';
import { DashboardHelper } from './helpers/dashboard.helper';
import { ACTIVITY } from '../../core/constants/wallet/activity.constant';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, RelativeTimePipe, DataTableComponent, StatsCardComponent, PageHeaderComponent, ErrorStateComponent],
  templateUrl: './templates/dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);

  private readonly requestedCurrency = signal<string | null>(null);
  private readonly isStaff = this.auth.isStaff;

  readonly typeIcon = (value: string): string => TransactionHelper.typeIcon(value);
  readonly typeClass = (value: string): string => TransactionHelper.typeClass(value);
  readonly formatType = (value: string): string => TransactionHelper.formatType(value);
  readonly statusClass = (value: string): string => TransactionHelper.statusClass(value);

  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly states = LOAD_STATE;
  readonly wallet = computed(() => this.walletService.wallet());
  readonly summaries = signal<WalletTransactionSummary[]>([]);
  readonly recentTx = signal<Transaction[]>([]);
  readonly userName = computed(() => this.auth.currentUser()?.displayName ?? 'User');
  readonly isUser = this.auth.isPlayer;

  readonly typeCellTemplate = viewChild<TemplateRef<{ row: Transaction; column: TableColumn<Transaction> }>>('typeCell');
  readonly mobileTxTemplate = viewChild<TemplateRef<{ row: Transaction }>>('mobileTx');

  readonly currencies = computed(() => this.summaries().map(summary => summary.currency));
  readonly hasMultipleCurrencies = computed(() => this.currencies().length > 1);

  readonly tableConfig = computed<DataTableConfig<Transaction>>(() => ({
    title: 'Recent Activity',
    columns: DashboardHelper.getDashboardTableColumns(this.wallet()?.currency ?? 'USD'),
    emptyMessage: 'No transactions yet',
    headerAction: { label: 'View all', link: '/wallet' }
  }));

  readonly selectedCurrency = computed(() => {
    const available = this.currencies();
    const requested = this.requestedCurrency();

    if (requested && available.includes(requested)) return requested;

    const walletCurrency = this.wallet()?.currency;
    if (walletCurrency && available.includes(walletCurrency)) return walletCurrency;

    return available[0] ?? null;
  });

  readonly activeStats = computed<StatCard[]>(() => {
    const summary = this.summaries().find(entry => entry.currency === this.selectedCurrency());
    return summary ? DashboardHelper.buildStatCards({ summary }) : [];
  });

  onSelectCurrency (currency: string): void {
    this.requestedCurrency.set(currency);
  }

  ngOnInit (): void {
    this.load();
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
    this.walletService.getOverview({ walletId: scope, page: ACTIVITY.PAGE, limit: ACTIVITY.LIMIT }).subscribe({
      next: ({ summary, recent }) => {
        this.summaries.set(summary);
        this.recentTx.set(recent.data);
        this.loading.set(false);
      },
      error: () => this.fail()
    });
  }

  private fail (): void {
    this.loading.set(false);
    this.failed.set(true);
  }
}
