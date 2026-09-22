import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { Transaction } from '../interfaces/wallet/transaction.interface';
import { WalletTransactionSummary } from '../interfaces/wallet/wallet-transaction-summary.interface';
import { Wallet } from '../interfaces/wallet/wallet.interface';
import { PaginatedResponse } from '../interfaces/http/paginated-response.interface';
import { environment } from '../../../environments/environment';
import { SELECTED_WALLET_KEY } from '../constants/wallet/selected-wallet-key.constant';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private readonly walletsSignal = signal<Wallet[]>([]);
  private readonly selectedIdSignal = signal<string | null>(localStorage.getItem(SELECTED_WALLET_KEY));
  private readonly transactionsSignal = signal<Transaction[]>([]);

  readonly wallets = computed(() => this.walletsSignal());
  readonly wallet = computed(() => this.walletsSignal().find(w => w.id === this.selectedIdSignal()) ?? this.walletsSignal()[0] ?? null);
  readonly transactions = computed(() => this.transactionsSignal());

  loadWallets (): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(`${this.apiUrl}/wallets`).pipe(
      tap(wallets => this.walletsSignal.set(wallets)),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  selectWallet (walletId: string): void {
    this.selectedIdSignal.set(walletId);
    localStorage.setItem(SELECTED_WALLET_KEY, walletId);
  }

  openWallet (currency: string): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets`, { currency }).pipe(
      tap(wallet => {
        this.walletsSignal.update(wallets => [...wallets, wallet]);
        this.selectWallet(wallet.id);
      }),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  getOpenableCurrencies (): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.apiUrl}/wallets/currencies`)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  getWallet (walletId: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.apiUrl}/wallets/${walletId}`).pipe(
      tap(fresh => this.walletsSignal.update(wallets => wallets.map(wallet => (wallet.id === fresh.id ? fresh : wallet)))),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  getSummary (walletId: string): Observable<WalletTransactionSummary[]> {
    return this.http
      .get<WalletTransactionSummary[]>(`${this.apiUrl}/wallet-transactions/${walletId}/summary`)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  getTransactions (walletId: string, page: number, limit: number): Observable<PaginatedResponse<Transaction>> {
    return this.http
      .get<PaginatedResponse<Transaction>>(`${this.apiUrl}/wallet-transactions/${walletId}/transactions`, {
        params: { page: page.toString(), limit: limit.toString() }
      })
      .pipe(
        tap(response => this.transactionsSignal.set(response.data)),
        catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
      );
  }

  reset (): void {
    this.walletsSignal.set([]);
    this.selectedIdSignal.set(null);
    this.transactionsSignal.set([]);
    localStorage.removeItem(SELECTED_WALLET_KEY);
  }
}
