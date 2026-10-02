import { Injectable, computed, signal } from '@angular/core';

import { AuthUser } from '../types/auth/auth-user.type';
import { SessionRefDto } from '../interfaces/auth/session-ref.interface';
import { UserRefDto } from '../interfaces/auth/user-ref.interface';
import { SESSION } from '../constants/auth/session.constant';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly expiresAtSignal = signal(0);

  readonly token = computed(() => this.tokenSignal());
  readonly user = computed(() => this.userSignal());
  readonly expiresAt = computed(() => this.expiresAtSignal());

  wasSignedIn (): boolean {
    return localStorage.getItem(SESSION.ACTIVE_HINT_KEY) === SESSION.ACTIVE_HINT_VALUE;
  }

  forgetSignIn (): void {
    localStorage.removeItem(SESSION.ACTIVE_HINT_KEY);
  }

  adoptUser ({ user }: UserRefDto): void {
    this.userSignal.set(user);
  }

  adopt ({ session }: SessionRefDto): void {
    this.tokenSignal.set(session.accessToken);
    this.userSignal.set(session.user);
    this.expiresAtSignal.set(Date.now() + session.expiresIn * SESSION.MILLISECONDS_PER_SECOND);
    localStorage.setItem(SESSION.ACTIVE_HINT_KEY, SESSION.ACTIVE_HINT_VALUE);
  }

  clear (): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.expiresAtSignal.set(0);
    localStorage.removeItem(SESSION.ACTIVE_HINT_KEY);
  }
}
