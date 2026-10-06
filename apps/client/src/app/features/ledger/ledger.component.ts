import { Component, ChangeDetectionStrategy, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LedgerService } from '../../core/services/ledger.service';
import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableConfig } from '../../core/interfaces/ui/data-table-config.interface';
import { LedgerEntry } from '../../core/interfaces/ledger/ledger-entry.interface';
import { ALL_RECORDS_SCOPE } from '../../core/constants/common/all-records-scope.constant';
import { LedgerHelper } from './helpers/ledger.helper';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';
import { LEDGER_PAGE } from '../../core/constants/ledger/ledger-page.constant';
import { AccountEntriesDto } from '../../core/interfaces/ledger/account-entries.interface';
import { LoadOnScrollDirective } from '../../shared/directives/load-on-scroll.directive';

@Component({
  selector: 'app-ledger',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyFormatPipe, DataTableComponent, PageHeaderComponent, ErrorStateComponent, LoadOnScrollDirective],
  templateUrl: './templates/ledger.component.html'
})
export class LedgerComponent implements OnInit {
  private readonly ledgerService = inject(LedgerService);
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);

  private readonly isStaff = this.auth.isStaff;

  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly states = LOAD_STATE;
  readonly account = computed(() => this.ledgerService.account());
  readonly entries = computed(() => this.ledgerService.entries());
  readonly isUser = this.auth.isPlayer;

  readonly hasMore = this.ledgerService.hasMore;
  readonly loadOlderLabel = LEDGER_PAGE.LOAD_OLDER;
  private scope: string | null = null;

  readonly tableConfig = computed<DataTableConfig<LedgerEntry>>(() => ({
    title: 'Entries',
    columns: LedgerHelper.getLedgerTableColumns(),
    emptyMessage: 'No entries'
  }));

  ngOnInit (): void {
    this.loadEntries();
  }

  loadOlder (): void {
    const oldest = this.entries().at(-1);
    if (!this.scope || !oldest || this.loading()) return;
    this.fetchEntries({ accountId: this.scope, limit: LEDGER_PAGE.SIZE, before: oldest.createdAt, beforeId: oldest.id });
  }

  loadEntries (): void {
    this.failed.set(false);
    if (this.isStaff()) {
      this.fetchEntries({ accountId: ALL_RECORDS_SCOPE, limit: LEDGER_PAGE.SIZE });
      return;
    }

    this.walletService.ensureWallets().subscribe({
      next: () => this.loadAccountEntries(this.walletService.wallet()?.ledgerAccountId),
      error: () => this.fail()
    });
  }

  private fetchEntries (request: AccountEntriesDto): void {
    this.loading.set(true);
    this.scope = request.accountId;
    this.ledgerService.getAccountEntries(request).subscribe({
      next: () => this.loading.set(false),
      error: () => this.fail()
    });
  }

  private loadAccountEntries (ledgerAccountId: string | undefined): void {
    if (!ledgerAccountId) {
      this.loading.set(false);
      return;
    }

    this.ledgerService.getAccount(ledgerAccountId).subscribe({
      next: () => this.fetchEntries({ accountId: ledgerAccountId, limit: LEDGER_PAGE.SIZE }),
      error: () => this.fail()
    });
  }

  private fail (): void {
    this.loading.set(false);
    this.failed.set(true);
  }
}
