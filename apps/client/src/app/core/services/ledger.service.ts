import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { LedgerAccount } from '../interfaces/ledger/ledger-account.interface';
import { LedgerEntry } from '../interfaces/ledger/ledger-entry.interface';
import { PaginatedResponse } from '../interfaces/http/paginated-response.interface';
import { AppConfigService } from './app-config.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';

@Injectable({ providedIn: 'root' })
export class LedgerService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private readonly accountSignal = signal<LedgerAccount | null>(null);
  private readonly entriesSignal = signal<LedgerEntry[]>([]);

  readonly account = computed(() => this.accountSignal());
  readonly entries = computed(() => this.entriesSignal());

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

  getAccountEntries (accountId: string, page: number, limit: number): Observable<PaginatedResponse<LedgerEntry>> {
    return this.http
      .get<PaginatedResponse<LedgerEntry>>(`${this.apiUrl}/ledgers/accounts/${accountId}/entries`, {
        params: { page: page.toString(), limit: limit.toString() }
      })
      .pipe(
        tap(response => this.entriesSignal.set(response.data)),
        catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
      );
  }
}
