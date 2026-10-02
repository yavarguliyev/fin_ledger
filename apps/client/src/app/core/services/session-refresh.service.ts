import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, firstValueFrom, map, of, shareReplay, tap } from 'rxjs';

import { AuthResponse } from '../interfaces/auth/auth-response.interface';
import { SESSION } from '../constants/auth/session.constant';
import { AppConfigService } from './app-config.service';
import { SessionStore } from './session-store.service';
import { SessionSyncService } from './session-sync.service';

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);
  private readonly store = inject(SessionStore);
  private readonly sync = inject(SessionSyncService);
  private restoreAttempted = false;
  private inFlight: Observable<AuthResponse | null> | null = null;

  canRefresh (): boolean {
    return !!this.store.token() || this.store.wasSignedIn();
  }

  hasFreshAccess (): boolean {
    return !!this.store.token() && Date.now() < this.store.expiresAt() - SESSION.EXPIRY_SKEW_MS;
  }

  ensureSession (): Observable<boolean> {
    if (this.hasFreshAccess()) return of(true);
    if (!this.store.token() && (this.restoreAttempted || !this.store.wasSignedIn())) return of(false);
    return this.refresh().pipe(map(session => !!session));
  }

  refresh (): Observable<AuthResponse | null> {
    if (this.inFlight) return this.inFlight;

    this.inFlight = this.http.post<AuthResponse>(`${this.config.apiUrl}${SESSION.REFRESH_PATH}`, {}, { withCredentials: true }).pipe(
      tap(session => {
        this.store.adopt({ session });
        this.sync.share({ session });
      }),
      catchError(() => {
        this.store.forgetSignIn();
        return of(null);
      }),
      finalize(() => {
        this.inFlight = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.inFlight;
  }

  async restore (): Promise<void> {
    if (this.store.wasSignedIn()) await firstValueFrom(this.refresh());
    this.restoreAttempted = true;
  }
}
