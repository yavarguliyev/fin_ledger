import { HttpErrorResponse, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { NEVER, Observable, Subject } from 'rxjs';

import { REQUEST_TIMEOUT } from '../../src/app/core/constants/http/request-timeout.constant';
import { RequestTimeoutHelper } from '../../src/app/core/helpers/http/request-timeout.helper';
import { requestTimeoutInterceptor } from '../../src/app/core/interceptors/request-timeout.interceptor';
import { REQUEST_TIMEOUT_TEST as T } from '../constants/request-timeout.constant';

const run = (next: Observable<HttpEvent<unknown>>): Observable<HttpEvent<unknown>> =>
  runInInjectionContext(Injector.create({ providers: [] }), () => requestTimeoutInterceptor(new HttpRequest('GET', T.URL), () => next));

describe('Request timeout', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('ends a request that never answers with a clear timeout error', () => {
    const errors: HttpErrorResponse[] = [];
    run(NEVER).subscribe({ error: (error: HttpErrorResponse) => errors.push(error) });

    jest.advanceTimersByTime(REQUEST_TIMEOUT.DEFAULT_MS);

    expect(errors[0]?.status).toBe(T.TIMEOUT_STATUS);
    expect((errors[0]?.error as { message: string }).message).toBe(REQUEST_TIMEOUT.MESSAGE);
  });

  it('lets an answer that arrives in time through untouched', () => {
    const responses = new Subject<HttpEvent<unknown>>();
    const received: HttpEvent<unknown>[] = [];
    run(responses).subscribe(event => received.push(event));

    jest.advanceTimersByTime(REQUEST_TIMEOUT.DEFAULT_MS - T.JUST_UNDER_MS);
    responses.next(new HttpResponse({ status: 200 }));

    expect(received).toHaveLength(1);
  });

  it('gives uploads longer than ordinary requests', () => {
    expect(RequestTimeoutHelper.limitFor({ body: new FormData() })).toBe(REQUEST_TIMEOUT.UPLOAD_MS);
    expect(RequestTimeoutHelper.limitFor({ body: null })).toBe(REQUEST_TIMEOUT.DEFAULT_MS);
  });
});
