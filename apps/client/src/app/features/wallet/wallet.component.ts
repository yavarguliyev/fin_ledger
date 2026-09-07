import { Component, inject, signal, computed, OnInit, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { Wallet, Transaction } from '../../core/models/wallet.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DataTableConfig, TableColumn } from '../../core/models/data-table.model';
import { PaginationConfig } from '../../core/models/base.mode';
import { DateUtil } from '../../core/utils/date.util';
import { typeIcon, typeClass, formatType, statusClass } from '../../core/utils/transaction.util';
import { getWalletTableColumns, exportTransactionsToCsv, getTransactionFilterOptions } from './wallet.util';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, RelativeTimePipe, DataTableComponent, PaginationComponent],
  templateUrl: './templates/wallet.component.html'
})
export class WalletComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);

  readonly loading = signal(true);
  readonly wallet = signal<Wallet | null>(null);
  readonly allTx = signal<Transaction[]>([]);
  readonly isUser = computed(() => this.auth.currentUser()?.role === 'user');

  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly totalItems = signal(0);
  readonly activeFilter = signal('ALL');

  readonly filteredTx = computed(() => {
    const filter = this.activeFilter();
    const transactions = this.allTx();
    if (filter === 'ALL') return transactions;
    return transactions.filter(tx => tx.type === filter);
  });

  readonly DateUtil = DateUtil;
  readonly typeIcon = typeIcon;
  readonly typeClass = typeClass;
  readonly formatType = formatType;
  readonly statusClass = statusClass;

  readonly typeCellTemplate = viewChild<TemplateRef<{ row: Transaction; column: TableColumn<Transaction> }>>('typeCell');
  readonly mobileTxTemplate = viewChild<TemplateRef<{ row: Transaction }>>('mobileTx');

  readonly total = computed(() => (this.wallet() ? this.wallet()!.availableBalanceMinor + this.wallet()!.reservedBalanceMinor : 0));
  readonly lastUpdated = computed(() => (this.wallet() ? DateUtil.formatRelative(this.wallet()!.updatedAt) : '—'));

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
    availablePageSizes: [10, 25, 50, 100]
  }));

  readonly tableConfig = computed<DataTableConfig<Transaction>>(() => ({
    title: 'Transaction History',
    columns: getWalletTableColumns(),
    showFilters: true,
    filterOptions: getTransactionFilterOptions(),
    showExport: true,
    exportLabel: 'Export CSV',
    emptyMessage: 'No transactions'
  }));

  ngOnInit (): void {
    this.refresh();
  }

  onExportClick (): void {
    exportTransactionsToCsv(this.allTx());
  }

  onFilterChange (filterValue: string): void {
    this.activeFilter.set(filterValue);
  }

  onPageChange (page: number): void {
    this.currentPage.set(page);
    const user = this.auth.currentUser();
    if (user?.walletId) this.loadTransactions(user.walletId);
  }

  onPageSizeChange (size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    const user = this.auth.currentUser();
    if (user?.walletId) this.loadTransactions(user.walletId);
  }

  refresh (): void {
    const user = this.auth.currentUser();
    const walletId = user?.walletId;

    if (!walletId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.walletService.getWallet(walletId).subscribe({
      next: () => {
        this.wallet.set(this.walletService.wallet() ?? null);
        this.loadTransactions(walletId);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadTransactions (walletId: string): void {
    this.loading.set(true);
    this.walletService.getTransactions(walletId, this.currentPage(), this.pageSize()).subscribe({
      next: response => {
        this.allTx.set(this.walletService.transactions() ?? []);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
