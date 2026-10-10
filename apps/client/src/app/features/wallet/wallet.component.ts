import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { Transaction } from '../../core/types/wallet/transaction.type';
import { Wallet } from '../../core/types/wallet/wallet.type';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PaginationConfig } from '../../core/interfaces/ui/pagination-config.interface';
import { ALL_RECORDS_SCOPE } from '../../core/constants/common/all-records-scope.constant';
import { WalletSwitcherComponent } from './wallet-switcher.component';
import { DateHelper } from '../../core/helpers/common/date.helper';
import { WalletHelper } from './helpers/wallet.helper';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BalanceHeroComponent } from '../../shared/components/balance-hero/balance-hero.component';
import { TransactionRowComponent } from '../../shared/components/transaction-row/transaction-row.component';
import { WALLET_VIEW } from '../../core/constants/wallet/wallet-view.constant';
import { CHIP } from '../../core/constants/ui/chip.constant';

@Component({
  selector: 'app-wallet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, PaginationComponent, WalletSwitcherComponent, ErrorStateComponent, IconComponent, PageHeaderComponent, BalanceHeroComponent, TransactionRowComponent],
  templateUrl: './templates/wallet.component.html'
})
export class WalletComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);

  readonly view = WALLET_VIEW;
  readonly states = LOAD_STATE;
  readonly placeholders = Array.from({ length: WALLET_VIEW.PLACEHOLDER_ROWS }, (_, index) => index);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly wallet = computed(() => this.walletService.wallet());
  readonly allTx = signal<Transaction[]>([]);
  readonly isUser = this.auth.isPlayer;
  private readonly isStaff = this.auth.isStaff;

  readonly currentPage = signal(1);
  readonly pageSize = signal<number>(WALLET_VIEW.DEFAULT_PAGE_SIZE);
  readonly totalItems = signal(0);
  readonly activeFilter = signal<string>(WALLET_VIEW.FILTER_ALL);

  readonly days = computed(() => WalletHelper.groupByDay({ transactions: WalletHelper.filter({ transactions: this.allTx(), filter: this.activeFilter() }) }));
  readonly chipClass = (id: string): string => (id === this.activeFilter() ? CHIP.ACTIVE : CHIP.IDLE);
  readonly title = computed(() => (this.isUser() ? WALLET_VIEW.PLAYER_TITLE : WALLET_VIEW.STAFF_TITLE));

  readonly subtitle = computed(() => {
    const wallet = this.wallet();
    if (!this.isUser() || !wallet) return WALLET_VIEW.STAFF_SUBTITLE;
    return `${WALLET_VIEW.UPDATED_PREFIX}${DateHelper.formatRelative(wallet.updatedAt)}`;
  });

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
    availablePageSizes: [...WALLET_VIEW.PAGE_SIZES]
  }));

  ngOnInit (): void {
    this.refresh();
  }

  onExportClick (): void {
    WalletHelper.exportTransactionsToCsv(this.allTx());
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
