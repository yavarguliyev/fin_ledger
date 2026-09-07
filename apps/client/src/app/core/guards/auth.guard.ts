import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/base.mode';

export const guestGuard: CanActivateFn = (): boolean => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return true;

  const user = auth.currentUser();
  const redirectPath = user?.role === 'user' ? '/betting' : '/dashboard';

  void router.navigate([redirectPath]);

  return false;
};

export const roleGuard = (allowedRoles?: UserRole[], redirectTo = '/dashboard'): CanActivateFn => {
  return (): boolean => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      void router.navigate(['/auth/login']);
      return false;
    }

    if (!allowedRoles) return true;

    const user = auth.currentUser();
    if (user && allowedRoles.includes(user.role)) return true;

    void router.navigate([redirectTo]);

    return false;
  };
};
