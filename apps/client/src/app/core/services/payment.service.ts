import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { Payment, PaymentRequest } from '../models/wallet.model';
import { environment } from '../../../environments/environment';
import { handleHttpError } from '../utils/http-error.util';
import { WalletService } from './wallet.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly walletService = inject(WalletService);

  deposit (walletId: string, req: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/deposit`, req).pipe(
      tap(() => this.walletService.getWallet(walletId).subscribe()),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  withdraw (walletId: string, req: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/withdraw`, req).pipe(
      tap(() => this.walletService.getWallet(walletId).subscribe()),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  getPayment (paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${paymentId}`).pipe(
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }
}
