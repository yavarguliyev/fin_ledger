import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { Wallet, Transaction, BetRequest, WalletTransactionSummary } from '../models/wallet.model';
import { PaginatedResponse } from '../models/base.mode';
import { environment } from '../../../environments/environment';
import { handleHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private walletSignal = signal<Wallet | null>(null);
  private transactionsSignal = signal<Transaction[]>([]);

  readonly wallet = computed(() => this.walletSignal());
  readonly transactions = computed(() => this.transactionsSignal());

  getWallet (walletId: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.apiUrl}/wallets/${walletId}`).pipe(
      tap(wallet => this.walletSignal.set(wallet)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  getSummary (walletId: string): Observable<WalletTransactionSummary> {
    return this.http
      .get<WalletTransactionSummary>(`${this.apiUrl}/wallet-transactions/${walletId}/summary`)
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  getTransactions (walletId: string, page: number, limit: number): Observable<PaginatedResponse<Transaction>> {
    return this.http
      .get<PaginatedResponse<Transaction>>(`${this.apiUrl}/wallet-transactions/${walletId}/transactions`, {
        params: { page: page.toString(), limit: limit.toString() }
      })
      .pipe(
        tap(response => this.transactionsSignal.set(response.data)),
        catchError((error: HttpErrorResponse) => handleHttpError(error))
      );
  }

  getBets (walletId: string, page: number, limit: number): Observable<PaginatedResponse<Transaction>> {
    return this.http
      .get<PaginatedResponse<Transaction>>(`${this.apiUrl}/wallet-transactions/${walletId}/bets`, {
        params: { page: page.toString(), limit: limit.toString() }
      })
      .pipe(
        tap(response => this.transactionsSignal.set(response.data)),
        catchError((error: HttpErrorResponse) => handleHttpError(error))
      );
  }

  placeBet (walletId: string, req: BetRequest): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets/${walletId}/bets`, req).pipe(
      tap(wallet => this.walletSignal.set(wallet)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  settleWinnings (walletId: string, amountMinor: number, transactionId: string, reference: string, currency: string): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets/${walletId}/winnings`, { amountMinor, currency, transactionId, reference }).pipe(
      tap(wallet => this.walletSignal.set(wallet)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  reserveFunds (walletId: string, amountMinor: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets/${walletId}/reserve`, { amountMinor }).pipe(
      tap(wallet => this.walletSignal.set(wallet)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  releaseFunds (walletId: string, amountMinor: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets/${walletId}/release`, { amountMinor }).pipe(
      tap(wallet => this.walletSignal.set(wallet)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  creditWallet (walletId: string, amountMinor: number, transactionId: string, reference: string, currency: string): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets/${walletId}/credit`, { amountMinor, currency, transactionId, reference }).pipe(
      tap(wallet => this.walletSignal.set(wallet)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  debitWallet (walletId: string, amountMinor: number, transactionId: string, reference: string, currency: string): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/wallets/${walletId}/debit`, { amountMinor, currency, transactionId, reference }).pipe(
      tap(wallet => this.walletSignal.set(wallet)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }
}
