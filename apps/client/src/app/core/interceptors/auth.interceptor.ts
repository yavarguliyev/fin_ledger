import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { PUBLIC_ALLOWED_COMPONENTS } from '../constants/app.constants';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (PUBLIC_ALLOWED_COMPONENTS.some(url => req.url.includes(url))) return next(req);

  const token = localStorage.getItem('access_token');
  const authService = inject(AuthService);
  const request = token ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !authService.isLoggingOut()) authService.logout();
      return throwError(() => error);
    })
  );
};
