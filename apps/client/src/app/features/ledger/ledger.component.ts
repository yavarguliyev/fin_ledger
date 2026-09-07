import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LedgerService } from '../../core/services/ledger.service';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableConfig } from '../../core/models/data-table.model';
import { PaginationConfig } from '../../core/models/base.mode';
import { LedgerEntry } from '../../core/models/ledger.model';
import { getLedgerTableColumns } from './ledger.util';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, DataTableComponent, PaginationComponent, PageHeaderComponent],
  templateUrl: './templates/ledger.component.html'
})
export class LedgerComponent implements OnInit {
  private readonly ledgerService = inject(LedgerService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly account = computed(() => this.ledgerService.account());
  readonly entries = computed(() => this.ledgerService.entries());
  readonly isUser = computed(() => this.auth.currentUser()?.role === 'user');

  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly totalItems = signal(0);

  readonly tableConfig = computed<DataTableConfig<LedgerEntry>>(() => ({
    title: 'Entries',
    columns: getLedgerTableColumns(),
    emptyMessage: 'No entries'
  }));

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
    availablePageSizes: [10, 25, 50, 100]
  }));

  ngOnInit (): void {
    this.loadEntries();
  }

  onPageChange (page: number): void {
    this.currentPage.set(page);
    this.loadEntries();
  }

  onPageSizeChange (size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadEntries();
  }

  private fetchEntries (ledgerAccountId: string): void {
    this.loading.set(true);

    const page = this.currentPage();
    const limit = this.pageSize();

    this.ledgerService.getAccountEntries(ledgerAccountId, page, limit).subscribe({
      next: response => {
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadEntries (): void {
    const user = this.auth.currentUser();
    const ledgerAccountId = user?.ledgerAccountId;

    if (!ledgerAccountId) {
      this.loading.set(false);
      return;
    }

    if (this.currentPage() === 1) {
      this.ledgerService.getAccount(ledgerAccountId).subscribe({
        next: () => this.fetchEntries(ledgerAccountId),
        error: () => this.loading.set(false)
      });
    } else this.fetchEntries(ledgerAccountId);
  }
}
