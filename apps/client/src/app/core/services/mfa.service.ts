import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { MfaCodeDto } from '../dtos/auth/mfa-code.dto';
import { DisableMfaDto } from '../dtos/auth/disable-mfa.dto';
import { MfaStatus } from '../interfaces/auth/mfa-status.interface';
import { MfaEnrollment } from '../interfaces/auth/mfa-enrollment.interface';
import { MfaRecoveryCodes } from '../interfaces/auth/mfa-recovery-codes.interface';

@Injectable({ providedIn: 'root' })
export class MfaService {
  private readonly apiUrl = `${environment.apiUrl}/auth/mfa`;
  private readonly http = inject(HttpClient);

  getStatus (): Observable<MfaStatus> {
    return this.http.get<MfaStatus>(`${this.apiUrl}/status`).pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  setup (): Observable<MfaEnrollment> {
    return this.http.post<MfaEnrollment>(`${this.apiUrl}/setup`, {}).pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  enable (dto: MfaCodeDto): Observable<MfaRecoveryCodes> {
    return this.http.post<MfaRecoveryCodes>(`${this.apiUrl}/enable`, dto).pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  disable (dto: DisableMfaDto): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/disable`, dto).pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
