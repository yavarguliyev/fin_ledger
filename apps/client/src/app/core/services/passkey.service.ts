import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

import { AppConfigService } from './app-config.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { PASSKEY } from '../constants/passkey/passkey.constant';
import { AuthResponse } from '../interfaces/auth/auth-response.interface';
import { PasskeyOwnerDto } from '../interfaces/passkey/passkey-owner.interface';
import { PasskeyRegistered } from '../interfaces/passkey/passkey-registered.interface';
import { PasskeySummary } from '../interfaces/passkey/passkey-summary.interface';
import { RegisterPasskeyDto } from '../interfaces/passkey/register-passkey.interface';
import { RemovePasskeyDto } from '../interfaces/passkey/remove-passkey.interface';
import { VerifyPasskeyLoginDto } from '../interfaces/passkey/verify-passkey-login.interface';
import { VerifyStepUpDto } from '../interfaces/passkey/verify-step-up.interface';

@Injectable({ providedIn: 'root' })
export class PasskeyService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private get apiUrl (): string {
    return `${this.config.apiUrl}${PASSKEY.BASE_PATH}`;
  }

  list (): Observable<PasskeySummary[]> {
    return this.send(this.http.get<PasskeySummary[]>(this.apiUrl));
  }

  registerOptions (): Observable<PublicKeyCredentialCreationOptionsJSON> {
    return this.send(this.http.post<PublicKeyCredentialCreationOptionsJSON>(`${this.apiUrl}${PASSKEY.REGISTER_OPTIONS_PATH}`, {}));
  }

  registerVerify (dto: RegisterPasskeyDto): Observable<PasskeyRegistered> {
    return this.send(this.http.post<PasskeyRegistered>(`${this.apiUrl}${PASSKEY.REGISTER_VERIFY_PATH}`, dto));
  }

  loginOptions (dto: PasskeyOwnerDto): Observable<PublicKeyCredentialRequestOptionsJSON> {
    return this.send(this.http.post<PublicKeyCredentialRequestOptionsJSON>(`${this.apiUrl}${PASSKEY.LOGIN_OPTIONS_PATH}`, dto));
  }

  loginVerify (dto: VerifyPasskeyLoginDto): Observable<AuthResponse> {
    return this.send(this.http.post<AuthResponse>(`${this.apiUrl}${PASSKEY.LOGIN_VERIFY_PATH}`, dto, { withCredentials: true }));
  }

  stepUpOptions (): Observable<PublicKeyCredentialRequestOptionsJSON> {
    return this.send(this.http.post<PublicKeyCredentialRequestOptionsJSON>(`${this.apiUrl}${PASSKEY.STEP_UP_OPTIONS_PATH}`, {}));
  }

  stepUpVerify (dto: VerifyStepUpDto): Observable<unknown> {
    return this.send(this.http.post(`${this.apiUrl}${PASSKEY.STEP_UP_VERIFY_PATH}`, dto));
  }

  remove ({ id }: RemovePasskeyDto): Observable<unknown> {
    return this.send(this.http.delete(`${this.apiUrl}/${id}`));
  }

  private send<T> (request: Observable<T>): Observable<T> {
    return request.pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
