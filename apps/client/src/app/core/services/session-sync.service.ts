import { Injectable, OnDestroy, inject } from '@angular/core';

import { SESSION } from '../constants/auth/session.constant';
import { SessionRefDto } from '../interfaces/auth/session-ref.interface';
import { SessionStore } from './session-store.service';

@Injectable({ providedIn: 'root' })
export class SessionSyncService implements OnDestroy {
  private readonly store = inject(SessionStore);
  private readonly channel: BroadcastChannel | null = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(SESSION.SYNC_CHANNEL);

  constructor () {
    if (this.channel) this.channel.onmessage = (event: MessageEvent<SessionRefDto>): void => this.store.adopt({ session: event.data.session });
  }

  share ({ session }: SessionRefDto): void {
    this.channel?.postMessage({ session });
  }

  ngOnDestroy (): void {
    this.channel?.close();
  }
}
