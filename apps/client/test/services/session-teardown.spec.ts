import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { SessionTeardownService } from '../../src/app/core/services/session-teardown.service';
import { NotificationService } from '../../src/app/core/services/notification.service';
import { SupportApiService } from '../../src/app/core/services/support-api.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportComposeStore } from '../../src/app/core/services/support-compose.store';
import { SupportCallStore } from '../../src/app/core/services/support-call.store';
import { SupportPresenceStore } from '../../src/app/core/services/support-presence.store';
import { SupportStreamService } from '../../src/app/core/services/support-stream.service';
import { SessionStore } from '../../src/app/core/services/session-store.service';
import { ThemeService } from '../../src/app/core/services/theme.service';
import { WalletService } from '../../src/app/core/services/wallet.service';

const teardownWith = (leavePresence: jest.Mock): SessionTeardownService => {
  const reset = { reset: jest.fn() };
  const injector = Injector.create({
    providers: [
      { provide: Router, useValue: { navigate: jest.fn().mockResolvedValue(true) } },
      { provide: ThemeService, useValue: { set: jest.fn() } },
      { provide: NotificationService, useValue: { disconnectSSE: jest.fn() } },
      { provide: WalletService, useValue: reset },
      { provide: SessionStore, useValue: { clear: jest.fn() } },
      { provide: SupportApiService, useValue: { leavePresence } },
      { provide: SupportChatStore, useValue: reset },
      { provide: SupportComposeStore, useValue: reset },
      { provide: SupportCallStore, useValue: reset },
      { provide: SupportPresenceStore, useValue: reset },
      { provide: SupportStreamService, useValue: { disconnect: jest.fn() } }
    ]
  });

  return runInInjectionContext(injector, () => new SessionTeardownService());
};

describe('SessionTeardownService', () => {
  it('tells the server it is leaving on a normal logout', () => {
    const leavePresence = jest.fn(() => of(null));

    teardownWith(leavePresence).run({ notifyServer: true });

    expect(leavePresence).toHaveBeenCalledTimes(1);
  });

  it('makes no server call when the session has already expired', () => {
    const leavePresence = jest.fn(() => of(null));

    teardownWith(leavePresence).run({ notifyServer: false });

    expect(leavePresence).not.toHaveBeenCalled();
  });
});
