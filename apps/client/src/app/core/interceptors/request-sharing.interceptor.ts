import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable, finalize, share } from 'rxjs';

import { REQUEST_SHARING } from '../constants/http/request-sharing.constant';

const inFlight = new Map<string, Observable<HttpEvent<unknown>>>();

export const requestSharingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== REQUEST_SHARING.METHOD) return next(req);

  const key = [req.responseType, req.urlWithParams].join(REQUEST_SHARING.KEY_SEPARATOR);
  const pending = inFlight.get(key);
  if (pending) return pending;

  const shared = next(req).pipe(
    finalize(() => inFlight.delete(key)),
    share()
  );
  inFlight.set(key, shared);
  return shared;
};
