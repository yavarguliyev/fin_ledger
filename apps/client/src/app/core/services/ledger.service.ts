import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { LedgerAccount, LedgerEntry } from '../models/ledger.model';
import { PaginatedResponse } from '../models/base.mode';
import { environment } from '../../../environments/environment';
import { handleHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class LedgerService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private readonly accountSignal = signal<LedgerAccount | null>(null);
  private readonly entriesSignal = signal<LedgerEntry[]>([]);

  readonly account = computed(() => this.accountSignal());
  readonly entries = computed(() => this.entriesSignal());

  getTransactionEntries (txId: string): Observable<LedgerEntry[]> {
    return this.http
      .get<LedgerEntry[]>(`${this.apiUrl}/ledgers/transactions/${txId}/entries`)
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  getAccount (accountId: string): Observable<LedgerAccount> {
    return this.http.get<LedgerAccount>(`${this.apiUrl}/ledgers/accounts/${accountId}`).pipe(
      tap(account => this.accountSignal.set(account)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  getAccountEntries (accountId: string, page: number, limit: number): Observable<PaginatedResponse<LedgerEntry>> {
    return this.http
      .get<PaginatedResponse<LedgerEntry>>(`${this.apiUrl}/ledgers/accounts/${accountId}/entries`, {
        params: { page: page.toString(), limit: limit.toString() }
      })
      .pipe(
        tap(response => this.entriesSignal.set(response.data)),
        catchError((error: HttpErrorResponse) => handleHttpError(error))
      );
  }
}
