import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';

import { SESSION } from '../constants/auth/session.constant';
import { AuthService } from '../services/auth.service';
import { SessionRefreshService } from '../services/session-refresh.service';
import { UserRole } from '../types/auth/user-role.type';

export const guestGuard: CanActivateFn = (): Observable<boolean> => {
  const auth = inject(AuthService);
  const refresh = inject(SessionRefreshService);
  const router = inject(Router);

  return refresh.ensureSession().pipe(
    map(active => {
      if (!active) return true;
      void router.navigate([auth.landingRoute()]);
      return false;
    })
  );
};

export const roleGuard = (allowedRoles?: readonly UserRole[], redirectTo = SESSION.STAFF_ROUTE): CanActivateFn => {
  return (_route, state: RouterStateSnapshot): Observable<boolean> => {
    const auth = inject(AuthService);
    const refresh = inject(SessionRefreshService);
    const router = inject(Router);

    return refresh.ensureSession().pipe(
      map(active => {
        if (!active) {
          void router.navigate([SESSION.LOGIN_ROUTE]);
          return false;
        }

        if (auth.mfaSetupRequired() && !state.url.startsWith(SESSION.PROFILE_ROUTE)) {
          void router.navigate([SESSION.PROFILE_ROUTE]);
          return false;
        }

        if (!allowedRoles) return true;

        const user = auth.currentUser();
        if (user && allowedRoles.includes(user.role)) return true;

        void router.navigate([redirectTo]);

        return false;
      })
    );
  };
};
