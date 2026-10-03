import { Injector, runInInjectionContext } from '@angular/core';

import { CONNECTIVITY } from '../../src/app/core/constants/ui/connectivity.constant';
import { ConnectivityService } from '../../src/app/core/services/connectivity.service';

const handlers = new Map<string, () => void>();

describe('ConnectivityService', () => {
  beforeEach(() => {
    handlers.clear();
    (globalThis as unknown as { window: unknown }).window = { addEventListener: (event: string, handler: () => void): void => void handlers.set(event, handler) };
    (globalThis as unknown as { navigator: unknown }).navigator = { onLine: true };
  });

  it('follows the browser going offline and coming back', () => {
    const connectivity = runInInjectionContext(Injector.create({ providers: [] }), () => new ConnectivityService());
    expect(connectivity.offline()).toBe(false);

    handlers.get(CONNECTIVITY.OFFLINE_EVENT)?.();
    expect(connectivity.offline()).toBe(true);

    handlers.get(CONNECTIVITY.ONLINE_EVENT)?.();
    expect(connectivity.offline()).toBe(false);
  });
});
