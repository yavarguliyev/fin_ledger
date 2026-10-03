import { Signal, signal } from '@angular/core';
import { ErrorMessageHelper } from '../../core/helpers/http/error-message.helper';

import { AdminUser } from '../../core/interfaces/admin/admin-user.interface';
import { DashboardStats } from '../../core/interfaces/admin/dashboard-stats.interface';
import { AdminApiService } from '../../core/services/admin-api.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { HttpError } from '../../core/interfaces/http/http-error.interface';
import { AccountStatusHelper } from './helpers/account-status.helper';
import { UserIdRefDto } from '../../core/interfaces/user/user-id-ref.interface';
import { UserToggleDto } from '../../core/interfaces/admin/user-toggle.interface';
import { WalletToggleDto } from '../../core/interfaces/admin/wallet-toggle.interface';
import { AdminUserHelper } from './helpers/admin-user.helper';

export class AdminHandlers {
  constructor (
    private readonly adminApi: AdminApiService,
    private readonly userService: UserService,
    private readonly toast: ToastService,
    private readonly allUsers: Signal<AdminUser[]>,

    private readonly updateUsers: (fn: (users: AdminUser[]) => AdminUser[]) => void,
    private readonly setDashboardStats: (stats: DashboardStats) => void,
    private readonly setLoading: (loading: boolean) => void,
    private readonly setSelectedUser: (user: AdminUser | null) => void,
    private readonly isAuthEnding: () => boolean
  ) {}

  readonly failed = signal(false);

  onView ({ userId }: UserIdRefDto): void {
    const user = this.allUsers().find(u => u.id === userId);
    if (user) this.setSelectedUser(user);
  }

  onAnonymize ({ userId }: UserIdRefDto): void {
    const user = this.allUsers().find(u => u.id === userId);
    if (!user) return;
    const message = `Anonymize ${user.email}? Their personal data will be erased permanently. Financial records are kept for compliance. This cannot be undone.`;
    this.toast.confirm({ message, onConfirm: () => this.applyAnonymize({ userId }) });
  }

  onEmailVerificationToggle ({ userId, isEnabled: isVerified }: UserToggleDto): void {
    this.userService.updateEmailVerification({ userId, isEmailVerified: isVerified }).subscribe({
      next: () => {
        this.updateUsers(users => users.map(u => (u.id === userId ? { ...u, isEmailVerified: isVerified } : u)));
        this.toast.success(`Email verification ${isVerified ? 'enabled' : 'disabled'}`);
      },
      error: (err: HttpError) => {
        const errorMessage = ErrorMessageHelper.from({ error: err, fallback: 'Failed to update email verification' });
        this.toast.error(errorMessage);
      }
    });
  }

  onDeletedToggle ({ userId }: UserIdRefDto): void {
    const user = this.allUsers().find(u => u.id === userId);
    if (!user) return;

    const isCurrentlyDeleted = user.deletedAt !== null;
    const action = isCurrentlyDeleted ? 'restore' : 'delete';

    this.userService.deleteUser(userId).subscribe({
      next: response => {
        this.updateUsers(users => users.map(u => (u.id === userId ? { ...u, deletedAt: isCurrentlyDeleted ? null : new Date().toISOString() } : u)));
        this.toast.success(response.message);
      },
      error: (err: HttpError) => {
        const errorMessage = ErrorMessageHelper.from({ error: err, fallback: `Failed to ${action} user` });
        this.toast.error(errorMessage);
      }
    });
  }

  onStatusToggle ({ walletId, isActive }: WalletToggleDto): void {
    const newStatus = isActive ? 'ACTIVE' : 'SUSPENDED';

    if (!walletId) {
      this.toast.error('User wallet not found');
      return;
    }

    this.userService.updateWalletStatus({ walletId, status: newStatus }).subscribe({
      next: () => {
        this.updateUsers(users => users.map(u => (u.walletId === walletId ? { ...u, status: newStatus } : u)));
        this.toast.success(`Wallet status updated to ${newStatus}`);
      },
      error: (err: HttpError) => {
        const errorMessage = ErrorMessageHelper.from({ error: err, fallback: 'Failed to update wallet status' });
        this.toast.error(errorMessage);
      }
    });
  }

  onAccountStatusToggle ({ userId, isEnabled: suspend }: UserToggleDto): void {
    const user = this.allUsers().find(u => u.id === userId);
    if (!user || !AccountStatusHelper.confirm({ email: user.email, suspend })) return;

    const request = suspend ? this.userService.suspendUser(userId) : this.userService.reactivateUser(userId);

    request.subscribe({
      next: () => {
        this.updateUsers(users => users.map(u => (u.id === userId ? { ...u, userStatus: suspend ? 'SUSPENDED' : 'ACTIVE' } : u)));
        this.toast.success(`Account ${suspend ? 'suspended' : 'reactivated'}`);
      },
      error: (err: HttpError) =>
        this.toast.error(ErrorMessageHelper.from({ error: err, fallback: `Failed to ${suspend ? 'suspend' : 'reactivate'} user` }))
    });
  }

  loadDashboardData (): void {
    this.setLoading(true);
    this.failed.set(false);
    this.adminApi.getDashboardData().subscribe({
      next: dashboard => {
        this.setDashboardStats(dashboard.stats);

        this.updateUsers(() => dashboard.users.map(user => AdminUserHelper.fromRecord({ user })));
        this.setLoading(false);
      },
      error: () => {
        if (this.isAuthEnding()) {
          this.setLoading(false);
          return;
        }

        this.failed.set(true);
        this.setLoading(false);
      }
    });
  }

  private applyAnonymize ({ userId }: UserIdRefDto): void {
    this.userService.anonymizeUser(userId).subscribe({
      next: response => {
        this.toast.success(response.message);
        this.loadDashboardData();
      },
      error: (err: HttpError) => this.toast.error(ErrorMessageHelper.from({ error: err, fallback: 'Failed to anonymize user' }))
    });
  }
}
