import { signal } from '@angular/core';
import { ErrorMessageHelper } from '../../core/helpers/http/error-message.helper';

import { AdminHandlersDeps } from '../../core/interfaces/admin/admin-handlers-deps.interface';
import { HttpError } from '../../core/interfaces/http/http-error.interface';
import { AccountStatusHelper } from './helpers/account-status.helper';
import { UserIdRefDto } from '../../core/interfaces/user/user-id-ref.interface';
import { UserToggleDto } from '../../core/interfaces/admin/user-toggle.interface';
import { WalletToggleDto } from '../../core/interfaces/admin/wallet-toggle.interface';
import { AdminUserHelper } from './helpers/admin-user.helper';
import { ADMIN_USERS_PAGE } from '../../core/constants/admin/admin-users-page.constant';
import { AdminUserPageQuery } from '../../core/interfaces/admin/admin-user-page-query.interface';

export class AdminHandlers {
  constructor (private readonly deps: AdminHandlersDeps) {}

  readonly failed = signal(false);
  readonly next = signal<AdminUserPageQuery | null>(null);

  onView ({ userId }: UserIdRefDto): void {
    const user = this.deps.allUsers().find(u => u.id === userId);
    if (user) this.deps.setSelectedUser(user);
  }

  onAnonymize ({ userId }: UserIdRefDto): void {
    const user = this.deps.allUsers().find(u => u.id === userId);
    if (!user) return;
    const message = `Anonymize ${user.email}? Their personal data will be erased permanently. Financial records are kept for compliance. This cannot be undone.`;
    this.deps.toast.confirm({ message, onConfirm: () => this.applyAnonymize({ userId }) });
  }

  onEmailVerificationToggle ({ userId, isEnabled: isVerified }: UserToggleDto): void {
    this.deps.userService.updateEmailVerification({ userId, isEmailVerified: isVerified }).subscribe({
      next: () => {
        this.deps.updateUsers(users => users.map(u => (u.id === userId ? { ...u, isEmailVerified: isVerified } : u)));
        this.deps.toast.success(`Email verification ${isVerified ? 'enabled' : 'disabled'}`);
      },
      error: (err: HttpError) => {
        const errorMessage = ErrorMessageHelper.from({ error: err, fallback: 'Failed to update email verification' });
        this.deps.toast.error(errorMessage);
      }
    });
  }

  onDeletedToggle ({ userId }: UserIdRefDto): void {
    const user = this.deps.allUsers().find(u => u.id === userId);
    if (!user) return;

    const isCurrentlyDeleted = user.deletedAt !== null;
    const action = isCurrentlyDeleted ? 'restore' : 'delete';

    this.deps.userService.deleteUser(userId).subscribe({
      next: response => {
        this.deps.updateUsers(users => users.map(u => (u.id === userId ? { ...u, deletedAt: isCurrentlyDeleted ? null : new Date().toISOString() } : u)));
        this.deps.toast.success(response.message);
      },
      error: (err: HttpError) => {
        const errorMessage = ErrorMessageHelper.from({ error: err, fallback: `Failed to ${action} user` });
        this.deps.toast.error(errorMessage);
      }
    });
  }

  onStatusToggle ({ walletId, isActive }: WalletToggleDto): void {
    const newStatus = isActive ? 'ACTIVE' : 'SUSPENDED';

    if (!walletId) {
      this.deps.toast.error('User wallet not found');
      return;
    }

    this.deps.userService.updateWalletStatus({ walletId, status: newStatus }).subscribe({
      next: () => {
        this.deps.updateUsers(users => users.map(u => (u.walletId === walletId ? { ...u, status: newStatus } : u)));
        this.deps.toast.success(`Wallet status updated to ${newStatus}`);
      },
      error: (err: HttpError) => {
        const errorMessage = ErrorMessageHelper.from({ error: err, fallback: 'Failed to update wallet status' });
        this.deps.toast.error(errorMessage);
      }
    });
  }

  onAccountStatusToggle ({ userId, isEnabled: suspend }: UserToggleDto): void {
    const user = this.deps.allUsers().find(u => u.id === userId);
    if (!user || !AccountStatusHelper.confirm({ email: user.email, suspend })) return;

    const request = suspend ? this.deps.userService.suspendUser(userId) : this.deps.userService.reactivateUser(userId);

    request.subscribe({
      next: () => {
        this.deps.updateUsers(users => users.map(u => (u.id === userId ? { ...u, userStatus: suspend ? 'SUSPENDED' : 'ACTIVE' } : u)));
        this.deps.toast.success(`Account ${suspend ? 'suspended' : 'reactivated'}`);
      },
      error: (err: HttpError) =>
        this.deps.toast.error(ErrorMessageHelper.from({ error: err, fallback: `Failed to ${suspend ? 'suspend' : 'reactivate'} user` }))
    });
  }

  loadDashboardData (): void {
    this.deps.setLoading(true);
    this.failed.set(false);
    this.deps.adminApi.getDashboardData().subscribe({
      next: dashboard => {
        this.deps.setDashboardStats(dashboard.stats);

        this.deps.updateUsers(() => dashboard.users.map(user => AdminUserHelper.fromRecord({ user })));
        this.next.set(dashboard.next);
        this.deps.setLoading(false);
      },
      error: () => {
        if (this.deps.isAuthEnding()) {
          this.deps.setLoading(false);
          return;
        }

        this.failed.set(true);
        this.deps.setLoading(false);
      }
    });
  }

  loadMoreUsers (): void {
    const query = this.next();
    if (!query) return;

    this.deps.setLoading(true);
    this.deps.adminApi.getUsers(query).subscribe({
      next: page => {
        this.deps.updateUsers(users => [...users, ...page.users.map(user => AdminUserHelper.fromRecord({ user }))]);
        this.next.set(page.next);
        this.deps.setLoading(false);
      },
      error: (err: HttpError) => {
        this.deps.setLoading(false);
        this.deps.toast.error(ErrorMessageHelper.from({ error: err, fallback: ADMIN_USERS_PAGE.LOAD_FAILED }));
      }
    });
  }

  private applyAnonymize ({ userId }: UserIdRefDto): void {
    this.deps.userService.anonymizeUser(userId).subscribe({
      next: response => {
        this.deps.toast.success(response.message);
        this.loadDashboardData();
      },
      error: (err: HttpError) => this.deps.toast.error(ErrorMessageHelper.from({ error: err, fallback: 'Failed to anonymize user' }))
    });
  }
}
