import { Component, inject, signal, computed, OnInit, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { NotificationService } from '../../core/services/notification.service';
import { Transaction } from '../../core/interfaces/wallet/transaction.interface';
import { WalletTransactionSummary } from '../../core/interfaces/wallet/wallet-transaction-summary.interface';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableConfig } from '../../core/interfaces/ui/data-table-config.interface';
import { TableColumn } from '../../core/interfaces/ui/table-column.interface';
import { ALL_RECORDS_SCOPE } from '../../core/constants/common/all-records-scope.constant';
import { RoleHelper } from '../../core/helpers/auth/role.helper';
import { CurrencyHelper } from '../../core/helpers/wallet/currency.helper';
import { TransactionHelper } from '../../core/helpers/wallet/transaction.helper';
import { DashboardHelper } from './helpers/dashboard.helper';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, RelativeTimePipe, DataTableComponent, StatsCardComponent, PageHeaderComponent],
  templateUrl: './templates/dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);
  private readonly notif = inject(NotificationService);

  readonly typeIcon = (value: string): string => TransactionHelper.typeIcon(value);
  readonly typeClass = (value: string): string => TransactionHelper.typeClass(value);
  readonly formatType = (value: string): string => TransactionHelper.formatType(value);
  readonly statusClass = (value: string): string => TransactionHelper.statusClass(value);

  readonly loading = signal(true);
  readonly wallet = computed(() => this.walletService.wallet());
  readonly summaries = signal<WalletTransactionSummary[]>([]);
  readonly recentTx = signal<Transaction[]>([]);
  readonly userName = computed(() => this.auth.currentUser()?.displayName ?? 'User');
  readonly isUser = computed(() => this.auth.currentUser()?.role === 'USER');
  private readonly isStaff = computed(() => RoleHelper.isStaffRole(this.auth.currentUser()?.role));

  readonly typeCellTemplate = viewChild<TemplateRef<{ row: Transaction; column: TableColumn<Transaction> }>>('typeCell');
  readonly mobileTxTemplate = viewChild<TemplateRef<{ row: Transaction }>>('mobileTx');

  readonly tableConfig = computed<DataTableConfig<Transaction>>(() => ({
    title: 'Recent Activity',
    columns: DashboardHelper.getDashboardTableColumns(this.wallet()?.currency ?? 'USD'),
    emptyMessage: 'No transactions yet',
    headerAction: { label: 'View all', link: '/wallet' }
  }));

  readonly statGroups = computed(() =>
    this.summaries().map(summary => ({
      currency: summary.currency,
      stats: [
        {
          label: 'Total Deposits',
          value: CurrencyHelper.formatCurrency(summary.totalDepositsMinor, summary.currency),
          icon: '📥',
          trend: '+12%',
          toneClass: 'bg-success/10 text-success'
        },
        {
          label: 'Total Withdrawals',
          value: CurrencyHelper.formatCurrency(summary.totalWithdrawalsMinor, summary.currency),
          icon: '📤',
          trend: '-4%',
          toneClass: 'bg-danger/10 text-danger'
        },
        { label: 'Bets Placed', value: String(summary.betsCount), icon: '🎯', trend: '+8%', toneClass: 'bg-primary/10 text-primary' },
        {
          label: 'Total Winnings',
          value: CurrencyHelper.formatCurrency(summary.totalWinningsMinor, summary.currency),
          icon: '🏆',
          trend: '+22%',
          toneClass: 'bg-warning/10 text-warning'
        }
      ]
    }))
  );

  readonly showCurrencyLabels = computed(() => this.statGroups().length > 1);

  ngOnInit (): void {
    const user = this.auth.currentUser();

    if (this.isStaff()) this.loadActivity(ALL_RECORDS_SCOPE);
    else {
      this.walletService.loadWallets().subscribe({
        next: () => {
          const walletId = this.walletService.wallet()?.id;
          if (walletId) this.loadActivity(walletId);
          else this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }

    if (user?.id) this.notif.getNotifications().subscribe();
  }

  private loadActivity (scope: string): void {
    this.walletService.getSummary(scope).subscribe({ next: summaries => this.summaries.set(summaries) });

    this.walletService.getTransactions(scope, 1, 10).subscribe({
      next: () => {
        this.recentTx.set(this.walletService.transactions() ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
