import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { CreatePaymentMethodRequest, PaymentMethod } from '../models/payment-method.model';
import { environment } from '../../../environments/environment';
import { handleHttpError } from '../utils/http-error.util';
import { PaymentMethodStatus } from '../models/base.mode';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  list (status?: PaymentMethodStatus): Observable<PaymentMethod[]> {
    const params = status ? `?status=${status}` : '';
    return this.http
      .get<PaymentMethod[]>(`${this.apiUrl}/payment-methods${params}`)
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  create (request: CreatePaymentMethodRequest): Observable<PaymentMethod> {
    return this.http
      .post<PaymentMethod>(`${this.apiUrl}/payment-methods`, request)
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  verify (id: string): Observable<PaymentMethod> {
    return this.http
      .post<PaymentMethod>(`${this.apiUrl}/payment-methods/${id}/verify`, {})
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  remove (id: string): Observable<PaymentMethod> {
    return this.http
      .delete<PaymentMethod>(`${this.apiUrl}/payment-methods/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }
}
