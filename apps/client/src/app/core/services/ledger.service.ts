import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { LedgerAccount } from '../interfaces/ledger/ledger-account.interface';
import { LedgerEntry } from '../interfaces/ledger/ledger-entry.interface';
import { AppConfigService } from './app-config.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { AccountEntriesDto } from '../interfaces/ledger/account-entries.interface';

@Injectable({ providedIn: 'root' })
export class LedgerService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private readonly accountSignal = signal<LedgerAccount | null>(null);
  private readonly entriesSignal = signal<LedgerEntry[]>([]);
  private readonly hasMoreSignal = signal(false);

  readonly account = computed(() => this.accountSignal());
  readonly entries = computed(() => this.entriesSignal());
  readonly hasMore = this.hasMoreSignal.asReadonly();

  private get apiUrl (): string {
    return this.config.apiUrl;
  }

  getTransactionEntries (txId: string): Observable<LedgerEntry[]> {
    return this.http
      .get<LedgerEntry[]>(`${this.apiUrl}/ledgers/transactions/${txId}/entries`)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  getAccount (accountId: string): Observable<LedgerAccount> {
    return this.http.get<LedgerAccount>(`${this.apiUrl}/ledgers/accounts/${accountId}`).pipe(
      tap(account => this.accountSignal.set(account)),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  getAccountEntries ({ accountId, limit, before, beforeId }: AccountEntriesDto): Observable<LedgerEntry[]> {
    const params = { limit: limit.toString(), ...(before && { before }), ...(beforeId && { beforeId }) };
    return this.http.get<LedgerEntry[]>(`${this.apiUrl}/ledgers/accounts/${accountId}/entries`, { params }).pipe(
      tap(page => {
        this.entriesSignal.set(before ? [...this.entriesSignal(), ...page] : page);
        this.hasMoreSignal.set(page.length === limit);
      }),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }
}
