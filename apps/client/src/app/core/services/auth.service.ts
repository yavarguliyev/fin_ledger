import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

import { AuthResponse } from '../interfaces/auth/auth-response.interface';
import { LoginRequest } from '../interfaces/auth/login-request.interface';
import { RegisterDto } from '../interfaces/auth/register-dto.interface';
import { RegisterResponse } from '../interfaces/auth/register-response.interface';
import { VerifyEmailDto } from '../interfaces/auth/verify-email.interface';
import { LoginDto } from '../interfaces/auth/login.interface';
import { ForgotPasswordDto } from '../interfaces/auth/forgot-password.interface';
import { ResetPasswordDto } from '../interfaces/auth/reset-password.interface';
import { MessageResponse } from '../interfaces/auth/message-response.interface';
import { UserRefDto } from '../interfaces/auth/user-ref.interface';
import { VerifyMfaLoginDto } from '../interfaces/auth/verify-mfa-login.interface';
import { LoginResult } from '../types/auth/login-result.type';
import { MfaHelper } from '../helpers/auth/mfa.helper';
import { RoleHelper } from '../helpers/auth/role.helper';
import { ROLES } from '../constants/auth/roles.constant';
import { SessionData } from '../interfaces/auth/session-data.interface';
import { SESSION } from '../constants/auth/session.constant';
import { SessionStore } from './session-store.service';
import { SessionTeardownService } from './session-teardown.service';
import { AppConfigService } from './app-config.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);
  private readonly store = inject(SessionStore);
  private readonly teardown = inject(SessionTeardownService);
  private readonly loggingOutSignal = signal(false);

  readonly token = this.store.token;
  readonly currentUser = this.store.user;
  readonly isAuthenticated = computed(() => !!this.store.token());
  readonly isLoggingOut = computed(() => this.loggingOutSignal());
  readonly isStaff = computed(() => RoleHelper.isStaff({ role: this.store.user()?.role }));
  readonly isPlayer = computed(() => RoleHelper.isPlayer({ role: this.store.user()?.role }));
  readonly isGlobalAdmin = computed(() => this.store.user()?.role === ROLES.GLOBAL_ADMIN);
  readonly mfaSetupRequired = computed(() => this.store.user()?.mfaSetupRequired === true);
  readonly selfExcludedUntil = computed(() => this.store.user()?.selfExclusionUntil ?? null);
  readonly roleLabel = computed(() => RoleHelper.label({ role: this.store.user()?.role }));

  forgetSession (): void {
    this.store.clear();
  }

  updateCurrentUser ({ user }: UserRefDto): void {
    this.store.adoptUser({ user });
  }

  getRememberedEmail (): string | null {
    return localStorage.getItem(SESSION.REMEMBERED_EMAIL_KEY);
  }

  logoutEverywhere (): Observable<unknown> {
    return this.http.post(`${this.config.apiUrl}${SESSION.LOGOUT_ALL_PATH}`, {}, { withCredentials: true }).pipe(tap(() => this.teardown.run()));
  }

  landingRoute (): string {
    if (this.mfaSetupRequired()) return SESSION.PROFILE_ROUTE;
    return RoleHelper.landingRoute({ role: this.store.user()?.role });
  }

  getSession (): SessionData | null {
    const user = this.currentUser();
    if (!user) return null;
    return { userId: user.id, email: user.email, displayName: user.displayName, role: user.role };
  }

  register (dto: RegisterDto): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.config.apiUrl}/auth/register`, dto)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  requestPasswordReset (dto: ForgotPasswordDto): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(`${this.config.apiUrl}/auth/forgot-password`, dto)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  resetPassword (dto: ResetPasswordDto): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(`${this.config.apiUrl}/auth/reset-password`, dto)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  verifyEmail (dto: VerifyEmailDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiUrl}/auth/verify-email`, dto, { withCredentials: true }).pipe(
      tap(session => this.store.adopt({ session })),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  verifyMfaLogin (dto: VerifyMfaLoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiUrl}/auth/mfa/verify`, dto, { withCredentials: true }).pipe(
      tap(session => this.store.adopt({ session })),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  login ({ email, password, rememberMe }: LoginDto): Observable<LoginResult> {
    const payload: LoginRequest = { email, password };

    return this.http.post<LoginResult>(`${this.config.apiUrl}/auth/login`, payload, { withCredentials: true }).pipe(
      tap(result => {
        const session = MfaHelper.sessionOf({ result });
        if (session) this.store.adopt({ session });
        if (rememberMe) localStorage.setItem(SESSION.REMEMBERED_EMAIL_KEY, email);
        else localStorage.removeItem(SESSION.REMEMBERED_EMAIL_KEY);
      }),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  logout (): void {
    const token = this.token();

    if (!token) {
      this.teardown.run();
      return;
    }

    const headers = { [SESSION.AUTH_HEADER]: `${SESSION.BEARER_PREFIX}${token}` };

    this.loggingOutSignal.set(true);
    this.teardown.run();

    this.http.post(`${this.config.apiUrl}${SESSION.LOGOUT_PATH}`, {}, { withCredentials: true, headers }).subscribe({
      next: () => this.loggingOutSignal.set(false),
      error: () => this.loggingOutSignal.set(false)
    });
  }
}
