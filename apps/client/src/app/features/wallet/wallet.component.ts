import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { Transaction } from '../../core/types/wallet/transaction.type';
import { Wallet } from '../../core/types/wallet/wallet.type';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DataTableConfig } from '../../core/interfaces/ui/data-table-config.interface';
import { TableColumn } from '../../core/interfaces/ui/table-column.interface';
import { PaginationConfig } from '../../core/interfaces/ui/pagination-config.interface';
import { ALL_RECORDS_SCOPE } from '../../core/constants/common/all-records-scope.constant';
import { WalletSwitcherComponent } from './wallet-switcher.component';
import { DateHelper } from '../../core/helpers/common/date.helper';
import { TransactionHelper } from '../../core/helpers/wallet/transaction.helper';
import { WalletHelper } from './helpers/wallet.helper';
import { ReceiptLinkComponent } from '../../shared/components/receipt-link/receipt-link.component';
import { RECEIPT } from '../../core/constants/payment/receipt.constant';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, RelativeTimePipe, DataTableComponent, PaginationComponent, WalletSwitcherComponent, ReceiptLinkComponent, ErrorStateComponent, IconComponent],
  templateUrl: './templates/wallet.component.html'
})
export class WalletComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);
  readonly receiptColumn = RECEIPT.COLUMN_KEY;

  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly wallet = computed(() => this.walletService.wallet());
  readonly allTx = signal<Transaction[]>([]);
  readonly isUser = this.auth.isPlayer;
  private readonly isStaff = this.auth.isStaff;

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

  readonly tx = TransactionHelper;
  readonly states = LOAD_STATE;

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

  readonly tableConfig = computed<DataTableConfig<Transaction>>(() => WalletHelper.transactionTable());

  ngOnInit (): void {
    this.refresh();
  }

  onExportClick (): void {
    WalletHelper.exportTransactionsToCsv(this.allTx());
  }

  onFilterChange (filterValue: string): void {
    this.activeFilter.set(filterValue);
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
    this.failed.set(false);
    this.walletService.loadWallets().subscribe({
      next: () => {
        const walletId = this.walletService.wallet()?.id;
        if (walletId) this.loadTransactions(walletId);
        else this.loading.set(false);
      },
      error: () => this.fail()
    });
  }

  onWalletChange (wallet: Wallet): void {
    this.currentPage.set(1);
    this.loadTransactions(wallet.id);
  }

  private transactionScope (): string | null {
    if (this.isStaff()) return ALL_RECORDS_SCOPE;
    return this.walletService.wallet()?.id ?? null;
  }

  private loadTransactions (walletId: string): void {
    this.loading.set(true);
    this.walletService.getTransactions({ walletId, page: this.currentPage(), limit: this.pageSize() }).subscribe({
      next: response => {
        this.allTx.set(this.walletService.transactions() ?? []);
        this.totalItems.set(response.total);
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
