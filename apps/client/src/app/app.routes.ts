import { Routes } from '@angular/router';

import { guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/betting', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./features/auth/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'auth/set-password',
    loadComponent: () => import('./features/auth/set-password.component').then(m => m.SetPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'legal/terms',
    loadComponent: () => import('./features/legal/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'legal/privacy',
    loadComponent: () => import('./features/legal/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [roleGuard(['admin', 'global admin'])]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleGuard()]
  },
  {
    path: 'ledger',
    loadComponent: () => import('./features/ledger/ledger.component').then(m => m.LedgerComponent),
    canActivate: [roleGuard()]
  },
  {
    path: 'wallet/deposit',
    loadComponent: () => import('./features/wallet/deposit.component').then(m => m.DepositComponent),
    canActivate: [roleGuard(['user'])]
  },
  {
    path: 'wallet/withdraw',
    loadComponent: () => import('./features/wallet/withdraw.component').then(m => m.WithdrawComponent),
    canActivate: [roleGuard(['user'])]
  },
  {
    path: 'wallet',
    loadComponent: () => import('./features/wallet/wallet.component').then(m => m.WalletComponent),
    canActivate: [roleGuard()]
  },
  {
    path: 'betting',
    loadComponent: () => import('./features/betting/betting.component').then(m => m.BettingComponent),
    canActivate: [roleGuard(['user'])]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [roleGuard()]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [roleGuard()]
  },
  { path: '**', redirectTo: '/betting' }
];
