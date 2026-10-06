import { HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';

import { responseCacheInterceptor } from '../../src/app/core/interceptors/response-cache.interceptor';
import { RESPONSE_CACHE_TEST as T } from '../constants/response-cache.constant';

const next = jest.fn(() => of(new HttpResponse({ body: T.BODY })));
const get = (): Promise<unknown> => firstValueFrom(responseCacheInterceptor(new HttpRequest(T.GET, T.URL), next));
const post = (): Promise<unknown> => firstValueFrom(responseCacheInterceptor(new HttpRequest(T.POST, T.URL, {}), next));

describe('responseCacheInterceptor', () => {
  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW);
    await post();
    next.mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it('answers a repeated GET from the cache within its short lifetime', async () => {
    await get();
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW + T.WITHIN_TTL_MS);

    await expect(get()).resolves.toMatchObject({ body: T.BODY });
    expect(next).toHaveBeenCalledTimes(T.ONE_CALL);
  });

  it('fetches again once the entry has expired', async () => {
    await get();
    jest.spyOn(Date, 'now').mockReturnValue(T.NOW + T.PAST_TTL_MS);
    await get();

    expect(next).toHaveBeenCalledTimes(T.TWO_CALLS);
  });

  it('drops every cached read after any write', async () => {
    await get();
    await post();
    await get();

    expect(next).toHaveBeenCalledTimes(T.TWO_CALLS + T.ONE_CALL);
  });
});
