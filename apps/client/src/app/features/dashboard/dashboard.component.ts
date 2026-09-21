import { Component, inject, signal, computed, OnInit, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { NotificationService } from '../../core/services/notification.service';
import { Transaction, WalletTransactionSummary } from '../../core/models/wallet.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableConfig, TableColumn } from '../../core/models/data-table.model';
import { getDashboardTableColumns, typeIcon, typeClass, formatType, statusClass } from './dashboard.util';
import { formatCurrency } from '../../core/helpers/currency.helper';
import { isStaffRole } from '../../core/helpers/role.helper';
import { ALL_RECORDS_SCOPE } from '../../core/constants/app.constants';

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
  readonly wallet = computed(() => this.walletService.wallet());
  readonly summaries = signal<WalletTransactionSummary[]>([]);
  readonly recentTx = signal<Transaction[]>([]);
  readonly userName = computed(() => this.auth.currentUser()?.displayName ?? 'User');
  readonly isUser = computed(() => this.auth.currentUser()?.role === 'USER');
  private readonly isStaff = computed(() => isStaffRole(this.auth.currentUser()?.role));

  readonly typeCellTemplate = viewChild<TemplateRef<{ row: Transaction; column: TableColumn<Transaction> }>>('typeCell');
  readonly mobileTxTemplate = viewChild<TemplateRef<{ row: Transaction }>>('mobileTx');

  readonly tableConfig = computed<DataTableConfig<Transaction>>(() => ({
    title: 'Recent Activity',
    columns: getDashboardTableColumns(this.wallet()?.currency ?? 'USD'),
    emptyMessage: 'No transactions yet',
    headerAction: { label: 'View all', link: '/wallet' }
  }));

  readonly statGroups = computed(() =>
    this.summaries().map(summary => ({
      currency: summary.currency,
      stats: [
        {
          label: 'Total Deposits',
          value: formatCurrency(summary.totalDepositsMinor, summary.currency),
          icon: '📥',
          trend: '+12%',
          toneClass: 'bg-success/10 text-success'
        },
        {
          label: 'Total Withdrawals',
          value: formatCurrency(summary.totalWithdrawalsMinor, summary.currency),
          icon: '📤',
          trend: '-4%',
          toneClass: 'bg-danger/10 text-danger'
        },
        { label: 'Bets Placed', value: String(summary.betsCount), icon: '🎯', trend: '+8%', toneClass: 'bg-primary/10 text-primary' },
        {
          label: 'Total Winnings',
          value: formatCurrency(summary.totalWinningsMinor, summary.currency),
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
