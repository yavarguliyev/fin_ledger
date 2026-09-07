import { Component, inject, signal, computed, OnInit, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { NotificationService } from '../../core/services/notification.service';
import { Wallet, Transaction, WalletTransactionSummary } from '../../core/models/wallet.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableConfig, TableColumn } from '../../core/models/data-table.model';
import { getDashboardTableColumns, typeIcon, typeClass, formatType, statusClass } from './dashboard.util';
import { formatCurrency } from '../../core/utils/currency.util';

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

  readonly typeIcon = typeIcon;
  readonly typeClass = typeClass;
  readonly formatType = formatType;
  readonly statusClass = statusClass;

  readonly loading = signal(true);
  readonly wallet = signal<Wallet | null>(null);
  readonly summary = signal<WalletTransactionSummary | null>(null);
  readonly recentTx = signal<Transaction[]>([]);
  readonly userName = computed(() => this.auth.currentUser()?.displayName ?? 'User');
  readonly isUser = computed(() => this.auth.currentUser()?.role === 'user');

  readonly typeCellTemplate = viewChild<TemplateRef<{ row: Transaction; column: TableColumn<Transaction> }>>('typeCell');
  readonly mobileTxTemplate = viewChild<TemplateRef<{ row: Transaction }>>('mobileTx');

  readonly tableConfig = computed<DataTableConfig<Transaction>>(() => ({
    title: 'Recent Activity',
    columns: getDashboardTableColumns(this.wallet()?.currency ?? 'USD'),
    emptyMessage: 'No transactions yet',
    headerAction: { label: 'View all', link: '/wallet' }
  }));

  readonly stats = computed(() => {
    const s = this.summary();

    const currency = this.wallet()?.currency ?? 'USD';
    const deposits = s?.totalDepositsMinor ?? 0;
    const withdrawals = s?.totalWithdrawalsMinor ?? 0;
    const bets = s?.betsCount ?? 0;
    const winnings = s?.totalWinningsMinor ?? 0;

    return [
      { label: 'Total Deposits', value: formatCurrency(deposits, currency), icon: '📥', trend: '+12%', toneClass: 'bg-success/10 text-success' },
      { label: 'Total Withdrawals', value: formatCurrency(withdrawals, currency), icon: '📤', trend: '-4%', toneClass: 'bg-danger/10 text-danger' },
      { label: 'Bets Placed', value: String(bets), icon: '🎯', trend: '+8%', toneClass: 'bg-primary/10 text-primary' },
      { label: 'Total Winnings', value: formatCurrency(winnings, currency), icon: '🏆', trend: '+22%', toneClass: 'bg-warning/10 text-warning' }
    ];
  });

  ngOnInit (): void {
    const user = this.auth.currentUser();
    const walletId = user?.walletId;

    if (!walletId) {
      this.loading.set(false);
      return;
    }

    this.walletService.getWallet(walletId).subscribe({
      next: () => {
        this.wallet.set(this.walletService.wallet() ?? null);
        this.walletService.getSummary(walletId).subscribe({ next: summary => this.summary.set(summary) });
        this.walletService.getTransactions(walletId, 1, 10).subscribe({
          next: () => {
            this.recentTx.set(this.walletService.transactions() ?? []);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });

    if (user?.id) this.notif.getNotifications().subscribe();
  }
}
