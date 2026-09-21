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
import { PaginationConfig } from '../../core/models/base.model';
import { DateUtil } from '../../core/helpers/date.helper';
import { typeIcon, typeClass, formatType, statusClass } from '../../core/helpers/transaction.helper';
import { getWalletTableColumns, exportTransactionsToCsv, getTransactionFilterOptions } from './wallet.util';
import { isStaffRole } from '../../core/helpers/role.helper';
import { ALL_RECORDS_SCOPE } from '../../core/constants/app.constants';
import { WalletSwitcherComponent } from './wallet-switcher.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, RelativeTimePipe, DataTableComponent, PaginationComponent, WalletSwitcherComponent],
  templateUrl: './templates/wallet.component.html'
})
export class WalletComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);

  readonly loading = signal(true);
  readonly wallet = computed(() => this.walletService.wallet());
  readonly allTx = signal<Transaction[]>([]);
  readonly isUser = computed(() => this.auth.currentUser()?.role === 'USER');
  private readonly isStaff = computed(() => isStaffRole(this.auth.currentUser()?.role));

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

  private transactionScope (): string | null {
    if (this.isStaff()) return ALL_RECORDS_SCOPE;
    return this.walletService.wallet()?.id ?? null;
  }

  onPageChange (page: number): void {
    this.currentPage.set(page);
    const scope = this.transactionScope();
    if (scope) this.loadTransactions(scope);
  }

  onPageSizeChange (size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    const scope = this.transactionScope();
    if (scope) this.loadTransactions(scope);
  }

  refresh (): void {
    if (this.isStaff()) {
      this.loadTransactions(ALL_RECORDS_SCOPE);
      return;
    }

    this.loading.set(true);
    this.walletService.loadWallets().subscribe({
      next: () => {
        const walletId = this.walletService.wallet()?.id;
        if (walletId) this.loadTransactions(walletId);
        else this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onWalletChange (wallet: Wallet): void {
    this.currentPage.set(1);
    this.loadTransactions(wallet.id);
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
