import { HttpErrorResponse, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, defer, throwError } from 'rxjs';

import { ReadRetryHelper } from '../../src/app/core/helpers/http/read-retry.helper';
import { readRetryInterceptor } from '../../src/app/core/interceptors/read-retry.interceptor';
import { READ_RETRY_TEST as T } from '../constants/read-retry.constant';

const failing = (status: number): { calls: () => number; next: () => Observable<HttpEvent<unknown>> } => {
  let calls = 0;
  return {
    calls: () => calls,
    next: () => defer(() => {
      calls += 1;
      return throwError(() => new HttpErrorResponse({ status }));
    })
  };
};

describe('Retrying safe reads', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('retries a GET twice when the server is briefly unavailable', () => {
    const backend = failing(T.UNAVAILABLE);
    readRetryInterceptor(new HttpRequest('GET', T.URL), backend.next).subscribe({ error: () => undefined });
    jest.advanceTimersByTime(T.ALL_DELAYS_MS);

    expect(backend.calls()).toBe(T.CALLS_WITH_RETRIES);
  });

  it('never retries a write, so a payment is not sent twice', () => {
    const backend = failing(T.UNAVAILABLE);
    readRetryInterceptor(new HttpRequest('POST', T.URL, {}), backend.next).subscribe({ error: () => undefined });
    jest.advanceTimersByTime(T.ALL_DELAYS_MS);

    expect(backend.calls()).toBe(1);
  });

  it('waits longer before each retry and gives up straight away on a real error', () => {
    expect(ReadRetryHelper.delayFor({ error: new HttpErrorResponse({ status: T.UNAVAILABLE }), attempt: 1 })).toBe(T.FIRST_DELAY_MS);
    expect(ReadRetryHelper.delayFor({ error: new HttpErrorResponse({ status: T.UNAVAILABLE }), attempt: 2 })).toBe(T.SECOND_DELAY_MS);
    expect(ReadRetryHelper.delayFor({ error: new HttpErrorResponse({ status: T.NOT_FOUND }), attempt: 1 })).toBeNull();
  });
});
