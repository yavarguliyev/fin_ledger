import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { PaymentMethod } from '../types/payment-method/payment-method.type';
import { AppConfigService } from './app-config.service';
import { PaymentMethodStatus } from '../types/payment-method/payment-method-status.type';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { CreateSetupSessionDto } from '../dtos/payment/create-setup-session.dto';
import { ConfirmSetupSessionDto } from '../dtos/payment/confirm-setup-session.dto';
import { SetupSession } from '../interfaces/payment/setup-session.interface';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private get apiUrl (): string {
    return this.config.apiUrl;
  }

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

  createSetupSession ({ provider, returnUrl }: CreateSetupSessionDto): Observable<SetupSession> {
    return this.http
      .post<SetupSession>(`${this.apiUrl}/payment-methods/${provider}/session`, { returnUrl })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  confirmSetupSession ({ provider, sessionId }: ConfirmSetupSessionDto): Observable<PaymentMethod> {
    return this.http
      .post<PaymentMethod>(`${this.apiUrl}/payment-methods/${provider}/confirm`, { sessionId })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
