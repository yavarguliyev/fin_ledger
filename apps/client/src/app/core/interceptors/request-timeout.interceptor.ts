import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { TimeoutError, catchError, throwError, timeout } from 'rxjs';

import { REQUEST_TIMEOUT } from '../constants/http/request-timeout.constant';
import { RequestTimeoutHelper } from '../helpers/http/request-timeout.helper';

export const requestTimeoutInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    timeout({ each: RequestTimeoutHelper.limitFor({ body: req.body }) }),
    catchError((error: unknown) =>
      throwError(() =>
        error instanceof TimeoutError
          ? new HttpErrorResponse({ status: REQUEST_TIMEOUT.STATUS, statusText: REQUEST_TIMEOUT.STATUS_TEXT, url: req.urlWithParams, error: { message: REQUEST_TIMEOUT.MESSAGE } })
          : error
      )
    )
  );
