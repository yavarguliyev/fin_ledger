import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap } from 'rxjs';

import { AuthResponse } from '../interfaces/auth/auth-response.interface';
import { AuthUser } from '../interfaces/auth/auth-user.interface';
import { LoginRequest } from '../interfaces/auth/login-request.interface';
import { RegisterDto } from '../interfaces/auth/register-dto.interface';
import { SessionData } from '../interfaces/auth/session-data.interface';
import { UpdateProfileResponse } from '../interfaces/auth/update-profile-response.interface';
import { ThemeService } from './theme.service';
import { NotificationService } from './notification.service';
import { WalletService } from './wallet.service';
import { environment } from '../../../environments/environment';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly notificationService = inject(NotificationService);
  private readonly walletService = inject(WalletService);
  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<AuthUser | null>(this.readUser());
  private readonly loggingOutSignal = signal(false);

  readonly token = computed(() => this.tokenSignal());
  readonly currentUser = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly isLoggingOut = computed(() => this.loggingOutSignal());

  getRememberedEmail (): string | null {
    return localStorage.getItem('remembered_email');
  }

  register (dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, dto).pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  requestPasswordReset (email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, { email })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  resetPassword (token: string, password: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, { token, password })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  verifyEmail (token: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/verify-email`, { token, password }).pipe(
      tap(response => this.persist(response)),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  getSession (): SessionData | null {
    const u = this.userSignal();
    if (!u) return null;
    return { userId: u.id, email: u.email, displayName: u.displayName, role: u.role };
  }

  updateUserSession (response: UpdateProfileResponse): void {
    this.tokenSignal.set(response.accessToken);
    this.userSignal.set(response.user);

    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  }

  login (email: string, password: string, rememberMe = false): Observable<AuthResponse> {
    const payload: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap(response => {
        this.persist(response);
        if (rememberMe) localStorage.setItem('remembered_email', email);
        else localStorage.removeItem('remembered_email');
      }),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  logout (): void {
    const token = this.tokenSignal();

    if (!token) {
      this.clearSession();
      return;
    }

    this.loggingOutSignal.set(true);
    this.clearSession();

    this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
      next: () => this.loggingOutSignal.set(false),
      error: () => this.loggingOutSignal.set(false)
    });
  }

  private readToken (): string | null {
    return localStorage.getItem('access_token');
  }

  private readUser (): AuthUser | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  private persist (response: AuthResponse): void {
    this.tokenSignal.set(response.accessToken);
    this.userSignal.set(response.user);

    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  }

  private clearSession (): void {
    this.notificationService.disconnectSSE();
    this.walletService.reset();
    this.tokenSignal.set(null);
    this.userSignal.set(null);

    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');

    this.theme.set('light');
    void this.router.navigate(['/auth/login']);
  }
}
