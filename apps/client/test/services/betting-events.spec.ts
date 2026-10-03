import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { BettingEventsService } from '../../src/app/features/betting/services/betting-events.service';
import { BettingService } from '../../src/app/core/services/betting.service';
import { HttpRequestError } from '../../src/app/core/errors/http-request.error';
import { LOAD_STATUS } from '../../src/app/core/constants/ui/load-status.constant';
import { BETTING_EVENTS_TEST as T } from '../constants/betting-events.constant';

const events = signal(Array.from({ length: T.TOTAL }, (_, index) => ({ id: String(index) })));
const loadEvents = jest.fn<Observable<unknown>, []>();

const create = (): BettingEventsService =>
  runInInjectionContext(Injector.create({ providers: [{ provide: BettingService, useValue: { events, loadEvents } }] }), () => new BettingEventsService());

describe('BettingEventsService', () => {
  it('shows events a page at a time', () => {
    const service = create();

    expect(service.visible()).toHaveLength(T.FIRST_PAGE);
    service.loadMore();
    expect(service.visible()).toHaveLength(T.TOTAL);
  });

  it('reports ready after a load and error when it fails, so the page can offer a retry', () => {
    const service = create();
    loadEvents.mockReturnValue(of([]));
    service.load();
    expect(service.status()).toBe(LOAD_STATUS.READY);

    loadEvents.mockReturnValue(throwError(() => new HttpRequestError({ message: T.MESSAGE, status: T.STATUS })));
    service.load();
    expect(service.status()).toBe(LOAD_STATUS.ERROR);
  });
});
