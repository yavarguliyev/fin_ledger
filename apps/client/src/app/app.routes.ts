import { Routes } from '@angular/router';

import { guestGuard, roleGuard } from './core/guards/auth.guard';
import { ROLE_SETS } from './core/constants/auth/role-sets.constant';
import { SESSION } from './core/constants/auth/session.constant';

const signedInRoutes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [roleGuard(ROLE_SETS.ADMIN)]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'ledger',
    loadComponent: () => import('./features/ledger/ledger.component').then(m => m.LedgerComponent)
  },
  {
    path: 'wallet/deposit',
    loadComponent: () => import('./features/wallet/deposit.component').then(m => m.DepositComponent),
    canActivate: [roleGuard(ROLE_SETS.PLAYER)]
  },
  {
    path: 'wallet/withdraw',
    loadComponent: () => import('./features/wallet/withdraw.component').then(m => m.WithdrawComponent),
    canActivate: [roleGuard(ROLE_SETS.PLAYER)]
  },
  {
    path: 'wallet',
    loadComponent: () => import('./features/wallet/wallet.component').then(m => m.WalletComponent)
  },
  {
    path: 'betting',
    loadComponent: () => import('./features/betting/betting.component').then(m => m.BettingComponent),
    canActivate: [roleGuard(ROLE_SETS.PLAYER)]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'support',
    loadComponent: () => import('./features/support/support.component').then(m => m.SupportComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  }
];

const guestRoutes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'set-password', loadComponent: () => import('./features/auth/set-password.component').then(m => m.SetPasswordComponent) }
];

export const routes: Routes = [
  { path: '', redirectTo: SESSION.PLAYER_ROUTE, pathMatch: 'full' },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./features/auth/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'auth/confirm-email-change',
    loadComponent: () => import('./features/auth/confirm-email-change.component').then(m => m.ConfirmEmailChangeComponent)
  },
  { path: 'auth', canActivate: [guestGuard], children: guestRoutes },
  {
    path: 'legal/terms',
    loadComponent: () => import('./features/legal/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'legal/privacy',
    loadComponent: () => import('./features/legal/privacy.component').then(m => m.PrivacyComponent)
  },
  { path: '', canActivate: [roleGuard()], canActivateChild: [roleGuard()], children: signedInRoutes },
  { path: '**', redirectTo: SESSION.PLAYER_ROUTE }
];
