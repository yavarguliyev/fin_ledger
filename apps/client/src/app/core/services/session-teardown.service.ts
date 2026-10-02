import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NotificationService } from './notification.service';
import { SupportApiService } from './support-api.service';
import { SupportChatStore } from './support-chat.store';
import { SupportComposeStore } from './support-compose.store';
import { SupportCallStore } from './support-call.store';
import { SupportPresenceStore } from './support-presence.store';
import { SupportStreamService } from './support-stream.service';
import { SESSION } from '../constants/auth/session.constant';
import { SessionStore } from './session-store.service';
import { ThemeService } from './theme.service';
import { WalletService } from './wallet.service';
import { SessionEndDto } from '../interfaces/auth/session-end.interface';

@Injectable({ providedIn: 'root' })
export class SessionTeardownService {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly notifications = inject(NotificationService);
  private readonly wallets = inject(WalletService);
  private readonly store = inject(SessionStore);
  private readonly supportApi = inject(SupportApiService);
  private readonly supportChat = inject(SupportChatStore);
  private readonly supportCompose = inject(SupportComposeStore);
  private readonly supportCalls = inject(SupportCallStore);
  private readonly supportPresence = inject(SupportPresenceStore);
  private readonly supportStream = inject(SupportStreamService);

  leave (): void {
    this.supportApi.leavePresence().subscribe({ error: () => undefined });
  }

  run ({ notifyServer }: SessionEndDto): void {
    if (notifyServer) this.leave();
    this.supportStream.disconnect();
    this.supportCalls.reset();
    this.supportChat.reset();
    this.supportCompose.reset();
    this.supportPresence.reset();
    this.notifications.disconnectSSE();
    this.wallets.reset();
    this.store.clear();
    this.theme.set(SESSION.DEFAULT_THEME);

    void this.router.navigate([SESSION.LOGIN_ROUTE]);
  }
}
