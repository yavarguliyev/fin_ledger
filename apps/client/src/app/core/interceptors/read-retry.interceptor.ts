import { HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

import { READ_RETRY } from '../constants/http/read-retry.constant';
import { ReadRetryHelper } from '../helpers/http/read-retry.helper';

export const readRetryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== READ_RETRY.METHOD) return next(req);

  return next(req).pipe(
    retry({
      count: READ_RETRY.ATTEMPTS,
      delay: (error: unknown, attempt: number) => {
        const delay = ReadRetryHelper.delayFor({ error, attempt });
        return delay === null ? throwError(() => error) : timer(delay);
      }
    })
  );
};
