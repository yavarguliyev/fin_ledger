import { Injector, runInInjectionContext } from '@angular/core';
import { setTimeout as delay } from 'node:timers/promises';

import { SessionSyncService } from '../../src/app/core/services/session-sync.service';
import { SessionStore } from '../../src/app/core/services/session-store.service';
import { AuthResponse } from '../../src/app/core/interfaces/auth/auth-response.interface';
import { SESSION_SYNC_TEST as T } from '../constants/session-sync.constant';

const tab = (): { sync: SessionSyncService; adopt: jest.Mock } => {
  const adopt = jest.fn();
  const injector = Injector.create({ providers: [{ provide: SessionStore, useValue: { adopt } }] });
  return { sync: runInInjectionContext(injector, () => new SessionSyncService()), adopt };
};

describe('SessionSyncService', () => {
  it('hands a refreshed session to the other open tabs, so they do not refresh again', async () => {
    const first = tab();
    const second = tab();

    first.sync.share({ session: T.SESSION as unknown as AuthResponse });
    await delay(T.DELIVERY_WAIT_MS);

    expect(second.adopt).toHaveBeenCalledWith({ session: T.SESSION });
    expect(first.adopt).not.toHaveBeenCalled();

    first.sync.ngOnDestroy();
    second.sync.ngOnDestroy();
  });
});
