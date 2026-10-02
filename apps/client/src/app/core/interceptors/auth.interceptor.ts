import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { SESSION } from '../constants/auth/session.constant';
import { DEVICE } from '../constants/device/device.constant';
import { AuthService } from '../services/auth.service';
import { SessionRefreshService } from '../services/session-refresh.service';
import { DeviceService } from '../services/device.service';
import { AuthInterceptorHelper } from '../helpers/auth/auth-interceptor.helper';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const device = inject(DeviceService);
  const tagged = req.clone({ headers: req.headers.set(DEVICE.HEADER, device.id()) });

  if (AuthInterceptorHelper.isPublic({ url: req.url })) return next(tagged);

  const authService = inject(AuthService);
  const refreshService = inject(SessionRefreshService);

  const authorize = (token: string | null): HttpRequest<unknown> => {
    return token ? tagged.clone({ headers: tagged.headers.set(SESSION.AUTH_HEADER, `${SESSION.BEARER_PREFIX}${token}`) }) : tagged;
  };

  if (req.url.includes(SESSION.REFRESH_PATH)) return next(tagged);
  if (tagged.headers.has(SESSION.AUTH_HEADER)) return next(tagged);

  if (!refreshService.hasFreshAccess()) {
    if (!refreshService.canRefresh()) return throwError(() => AuthInterceptorHelper.noSession({ url: req.url }));

    return refreshService.refresh().pipe(
      switchMap(session => {
        if (!session) {
          authService.expire();
          return throwError(() => AuthInterceptorHelper.noSession({ url: req.url }));
        }

        return next(authorize(session.accessToken));
      })
    );
  }

  return next(authorize(authService.token())).pipe(
    catchError((error: HttpErrorResponse) => {
      const refreshable = !req.url.includes(SESSION.REFRESH_PATH) && refreshService.canRefresh();
      const retryable = error.status === SESSION.UNAUTHORIZED && !authService.isLoggingOut() && refreshable;
      if (!retryable) return throwError(() => error);

      return refreshService.refresh().pipe(
        switchMap(session => {
          if (!session) {
            authService.expire();
            return throwError(() => error);
          }

          return next(authorize(session.accessToken));
        })
      );
    })
  );
};
