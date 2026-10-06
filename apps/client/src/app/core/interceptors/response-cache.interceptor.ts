import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

import { RESPONSE_CACHE } from '../constants/http/response-cache.constant';
import { CachedResponse } from '../interfaces/http/cached-response.interface';

const cache = new Map<string, CachedResponse>();

export const responseCacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== RESPONSE_CACHE.METHOD) {
    cache.clear();
    return next(req);
  }

  const key = [req.responseType, req.urlWithParams].join(RESPONSE_CACHE.KEY_SEPARATOR);
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return of(hit.response.clone());

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.ok) cache.set(key, { response: event, expiresAt: Date.now() + RESPONSE_CACHE.TTL_MS });
    })
  );
};
