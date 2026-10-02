import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { PageViewTrackerService } from '../../src/app/core/services/page-view-tracker.service';
import { AppConfigService } from '../../src/app/core/services/app-config.service';
import { PAGE_VIEW_TEST as T } from '../constants/page-view.constant';

const setup = (): { tracker: PageViewTrackerService; navigate: (id: number) => void; sendBeacon: jest.Mock<boolean, [string, Blob]> } => {
  const events = new Subject<unknown>();
  const sendBeacon = jest.fn<boolean, [string, Blob]>().mockReturnValue(true);
  const root = { routeConfig: null, firstChild: { routeConfig: { path: 'wallet' }, firstChild: null } };
  const document = { addEventListener: jest.fn(), visibilityState: 'visible', defaultView: { navigator: { sendBeacon }, addEventListener: jest.fn() } };
  const injector = Injector.create({
    providers: [
      { provide: Router, useValue: { events, routerState: { snapshot: { root } } } },
      { provide: AppConfigService, useValue: { apiUrl: T.API } },
      { provide: DOCUMENT, useValue: document }
    ]
  });
  const tracker = runInInjectionContext(injector, () => new PageViewTrackerService());
  tracker.listen();

  return { tracker, navigate: (id: number): void => events.next(new NavigationEnd(id, T.WALLET_ROUTE, T.WALLET_ROUTE)), sendBeacon };
};

const sentSummary = async (sendBeacon: jest.Mock<boolean, [string, Blob]>): Promise<unknown> => {
  const [, blob] = sendBeacon.mock.calls[0] ?? [];
  return JSON.parse((await blob?.text()) ?? '') as unknown;
};

describe('PageViewTrackerService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('splits calls into the page load and later, counts repeats, and ignores its own beacon', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(T.START);
    const { tracker, navigate, sendBeacon } = setup();

    navigate(1);
    tracker.record({ method: T.GET, url: T.WALLETS });
    tracker.record({ method: T.GET, url: T.WALLETS });
    tracker.record({ method: T.GET, url: T.TELEMETRY });
    now.mockReturnValue(T.LATER);
    tracker.record({ method: T.GET, url: T.NOTIFICATIONS });
    navigate(2);

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    await expect(sentSummary(sendBeacon)).resolves.toEqual({ route: T.WALLET_ROUTE, initialCalls: 2, laterCalls: 1, duplicates: 1 });
  });
});
