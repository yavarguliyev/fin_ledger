import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { PaymentRequest } from '../interfaces/wallet/payment-request.interface';
import { Payment } from '../interfaces/wallet/payment.interface';
import { AppConfigService } from './app-config.service';
import { WalletService } from './wallet.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);
  private readonly walletService = inject(WalletService);

  private get apiUrl (): string {
    return this.config.apiUrl;
  }

  deposit (req: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/deposit`, req).pipe(
      tap(() => this.walletService.loadWallets().subscribe()),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  withdraw (req: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/withdraw`, req).pipe(
      tap(() => this.walletService.loadWallets().subscribe()),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  getPayment (paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${paymentId}`).pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
