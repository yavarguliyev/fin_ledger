import { HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';

import { requestSharingInterceptor } from '../../src/app/core/interceptors/request-sharing.interceptor';
import { REQUEST_SHARING_TEST as T } from '../constants/request-sharing.constant';

const backend = (): { next: jest.Mock; respond: () => void } => {
  const pending: Subject<HttpEvent<unknown>>[] = [];
  const next = jest.fn(() => {
    const subject = new Subject<HttpEvent<unknown>>();
    pending.push(subject);
    return subject.asObservable();
  });
  const respond = (): void => {
    pending.splice(0).forEach(subject => {
      subject.next(new HttpResponse({ body: T.BODY }));
      subject.complete();
    });
  };

  return { next, respond };
};

describe('requestSharingInterceptor', () => {
  it('makes one call for identical GETs in flight and gives both the response', async () => {
    const { next, respond } = backend();
    const first = firstValueFrom(requestSharingInterceptor(new HttpRequest(T.GET, T.URL), next));
    const second = firstValueFrom(requestSharingInterceptor(new HttpRequest(T.GET, T.URL), next));

    respond();

    expect(next).toHaveBeenCalledTimes(1);
    await expect(first).resolves.toMatchObject({ body: T.BODY });
    await expect(second).resolves.toMatchObject({ body: T.BODY });
  });

  it('makes a fresh call once the earlier one has finished, and never shares different URLs', async () => {
    const { next, respond } = backend();
    const first = firstValueFrom(requestSharingInterceptor(new HttpRequest(T.GET, T.URL), next));
    respond();
    await first;

    const again = firstValueFrom(requestSharingInterceptor(new HttpRequest(T.GET, T.URL), next));
    const other = firstValueFrom(requestSharingInterceptor(new HttpRequest(T.GET, T.OTHER_URL), next));
    respond();
    await Promise.all([again, other]);

    expect(next).toHaveBeenCalledTimes(3);
  });

  it('never shares a POST', async () => {
    const { next, respond } = backend();
    const first = firstValueFrom(requestSharingInterceptor(new HttpRequest(T.POST, T.URL, {}), next));
    const second = firstValueFrom(requestSharingInterceptor(new HttpRequest(T.POST, T.URL, {}), next));
    respond();
    await Promise.all([first, second]);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
