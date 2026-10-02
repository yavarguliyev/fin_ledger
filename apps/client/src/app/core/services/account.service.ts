import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

import { AuthResponse } from '../interfaces/auth/auth-response.interface';
import { MessageResponse } from '../interfaces/auth/message-response.interface';
import { ChangePasswordDto } from '../interfaces/account/change-password.interface';
import { ChangeEmailDto } from '../interfaces/account/change-email.interface';
import { ConfirmEmailChangeDto } from '../interfaces/account/confirm-email-change.interface';
import { ACCOUNT } from '../constants/account/account.constant';
import { AppConfigService } from './app-config.service';
import { SessionStore } from './session-store.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);
  private readonly store = inject(SessionStore);

  changePassword (dto: ChangePasswordDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiUrl}${ACCOUNT.CHANGE_PASSWORD_PATH}`, dto, { withCredentials: true }).pipe(
      tap(session => this.store.adopt({ session })),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  changeEmail (dto: ChangeEmailDto): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(`${this.config.apiUrl}${ACCOUNT.CHANGE_EMAIL_PATH}`, dto)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  confirmEmailChange (dto: ConfirmEmailChangeDto): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(`${this.config.apiUrl}${ACCOUNT.CONFIRM_EMAIL_CHANGE_PATH}`, dto)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
