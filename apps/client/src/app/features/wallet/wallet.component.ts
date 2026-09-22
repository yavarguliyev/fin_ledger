import { Component, inject, signal, computed, OnInit, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { Transaction } from '../../core/interfaces/wallet/transaction.interface';
import { Wallet } from '../../core/interfaces/wallet/wallet.interface';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DataTableConfig } from '../../core/interfaces/ui/data-table-config.interface';
import { TableColumn } from '../../core/interfaces/ui/table-column.interface';
import { PaginationConfig } from '../../core/interfaces/ui/pagination-config.interface';
import { ALL_RECORDS_SCOPE } from '../../core/constants/common/all-records-scope.constant';
import { WalletSwitcherComponent } from './wallet-switcher.component';
import { RoleHelper } from '../../core/helpers/auth/role.helper';
import { DateHelper } from '../../core/helpers/common/date.helper';
import { TransactionHelper } from '../../core/helpers/wallet/transaction.helper';
import { WalletHelper } from './helpers/wallet.helper';

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
  private readonly isStaff = computed(() => RoleHelper.isStaffRole(this.auth.currentUser()?.role));

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

  readonly typeIcon = (value: string): string => TransactionHelper.typeIcon(value);
  readonly typeClass = (value: string): string => TransactionHelper.typeClass(value);
  readonly formatType = (value: string): string => TransactionHelper.formatType(value);
  readonly statusClass = (value: string): string => TransactionHelper.statusClass(value);

  readonly typeCellTemplate = viewChild<TemplateRef<{ row: Transaction; column: TableColumn<Transaction> }>>('typeCell');
  readonly mobileTxTemplate = viewChild<TemplateRef<{ row: Transaction }>>('mobileTx');

  readonly total = computed(() => (this.wallet() ? this.wallet()!.availableBalanceMinor + this.wallet()!.reservedBalanceMinor : 0));
  readonly lastUpdated = computed(() => (this.wallet() ? DateHelper.formatRelative(this.wallet()!.updatedAt) : '—'));

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
    availablePageSizes: [10, 25, 50, 100]
  }));

  readonly tableConfig = computed<DataTableConfig<Transaction>>(() => ({
    title: 'Transaction History',
    columns: WalletHelper.getWalletTableColumns(),
    showFilters: true,
    filterOptions: WalletHelper.getTransactionFilterOptions(),
    showExport: true,
    exportLabel: 'Export CSV',
    emptyMessage: 'No transactions'
  }));

  ngOnInit (): void {
    this.refresh();
  }

  onExportClick (): void {
    WalletHelper.exportTransactionsToCsv(this.allTx());
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
