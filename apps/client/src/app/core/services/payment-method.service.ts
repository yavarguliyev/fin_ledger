import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { PaymentMethod } from '../interfaces/payment-method/payment-method.interface';
import { environment } from '../../../environments/environment';
import { PaymentMethodStatus } from '../types/payment-method/payment-method-status.type';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  list (status?: PaymentMethodStatus): Observable<PaymentMethod[]> {
    const params = status ? `?status=${status}` : '';
    return this.http
      .get<PaymentMethod[]>(`${this.apiUrl}/payment-methods${params}`)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  verify (id: string): Observable<PaymentMethod> {
    return this.http
      .post<PaymentMethod>(`${this.apiUrl}/payment-methods/${id}/verify`, {})
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  remove (id: string): Observable<PaymentMethod> {
    return this.http
      .delete<PaymentMethod>(`${this.apiUrl}/payment-methods/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  createSetupSession (provider: string, returnUrl: string): Observable<{ url: string; sessionId: string }> {
    return this.http
      .post<{ url: string; sessionId: string }>(`${this.apiUrl}/payment-methods/${provider}/session`, { returnUrl })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  confirmSetupSession (provider: string, sessionId: string): Observable<PaymentMethod> {
    return this.http
      .post<PaymentMethod>(`${this.apiUrl}/payment-methods/${provider}/confirm`, { sessionId })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
