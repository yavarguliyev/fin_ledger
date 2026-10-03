import { DestroyRef, Injector, NgZone, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SupportStreamService } from '../../src/app/core/services/support-stream.service';
import { SupportApiService } from '../../src/app/core/services/support-api.service';
import { SUPPORT_STREAM_TEST as T } from '../constants/support-stream.constant';
import { stubGlobal } from '../fakes/global.fake';

class FakeEventSource {
  static opened: FakeEventSource[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor () {
    FakeEventSource.opened.push(this);
  }

  close (): void {
    this.onopen = null;
  }
}

describe('SupportStreamService reconnects', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    FakeEventSource.opened = [];
    stubGlobal({ name: 'EventSource', value: FakeEventSource });
  });

  afterEach(() => jest.useRealTimers());

  it('asks for a reload only after a reconnect, never on the first connection', async () => {
    const injector = Injector.create({
      providers: [
        { provide: SupportApiService, useValue: { streamTicket: (): Observable<{ ticket: string }> => of({ ticket: T.TICKET }), streamUrl: (): string => T.URL } },
        { provide: NgZone, useValue: { run: (fn: () => void): void => fn() } },
        { provide: DestroyRef, useValue: { onDestroy: (): void => undefined } }
      ]
    });
    const stream = runInInjectionContext(injector, () => new SupportStreamService());
    const onReconnect = jest.fn();

    stream.connect({ onMessage: jest.fn(), onReconnect });
    FakeEventSource.opened[0]?.onopen?.();
    expect(onReconnect).not.toHaveBeenCalled();

    FakeEventSource.opened[0]?.onerror?.();
    await jest.advanceTimersByTimeAsync(T.RECONNECT_WAIT_MS);
    FakeEventSource.opened[1]?.onopen?.();

    expect(FakeEventSource.opened).toHaveLength(2);
    expect(onReconnect).toHaveBeenCalledTimes(1);
    stream.disconnect();
  });
});
