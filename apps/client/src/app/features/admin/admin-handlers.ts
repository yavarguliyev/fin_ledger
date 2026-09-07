import { Signal } from '@angular/core';

import { AdminUser, DashboardStats } from '../../core/models/admin.model';
import { AdminApiService } from '../../core/services/admin-api.service';
import { ToastService } from '../../core/services/toast.service';
import { HttpError, UserRole } from '../../core/models/base.mode';

export class AdminHandlers {
  constructor (
    private readonly adminApi: AdminApiService,
    private readonly toast: ToastService,
    private readonly allUsers: Signal<AdminUser[]>,

    private readonly updateUsers: (fn: (users: AdminUser[]) => AdminUser[]) => void,
    private readonly setDashboardStats: (stats: DashboardStats) => void,
    private readonly setLoading: (loading: boolean) => void,
    private readonly setSelectedUser: (user: AdminUser | null) => void,
    private readonly isAuthEnding: () => boolean
  ) {}

  onView (userId: string): void {
    const user = this.allUsers().find(u => u.id === userId);
    if (user) this.setSelectedUser(user);
  }

  onEmailVerificationToggle (userId: string, isVerified: boolean): void {
    this.adminApi.updateEmailVerification(userId, isVerified).subscribe({
      next: () => {
        this.updateUsers(users => users.map(u => (u.id === userId ? { ...u, isEmailVerified: isVerified } : u)));
        this.toast.success(`Email verification ${isVerified ? 'enabled' : 'disabled'}`);
      },
      error: (err: HttpError) => {
        const errorMessage = err?.error?.message ?? err?.message ?? 'Failed to update email verification';
        this.toast.error(errorMessage);
      }
    });
  }

  onDeletedToggle (userId: string): void {
    const user = this.allUsers().find(u => u.id === userId);
    if (!user) return;

    const isCurrentlyDeleted = user.deletedAt !== null;
    const action = isCurrentlyDeleted ? 'restore' : 'delete';

    this.adminApi.deleteUser(userId).subscribe({
      next: response => {
        this.updateUsers(users => users.map(u => (u.id === userId ? { ...u, deletedAt: isCurrentlyDeleted ? null : new Date().toISOString() } : u)));
        this.toast.success(response.message);
      },
      error: (err: HttpError) => {
        const errorMessage = err?.error?.message ?? err?.message ?? `Failed to ${action} user`;
        this.toast.error(errorMessage);
      }
    });
  }

  onDelete (userId: string): void {
    const user = this.allUsers().find(u => u.id === userId);
    if (!user) return;

    this.toast.confirm(`Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`, () => {
      this.adminApi.deleteUserFromDb(userId).subscribe({
        next: response => {
          this.toast.success(response.message);
          this.updateUsers(users => users.filter(u => u.id !== userId));
          this.loadDashboardData();
        },
        error: (err: HttpError) => {
          const errorMessage = err?.error?.message ?? err?.message ?? `Failed to delete user`;
          this.toast.error(errorMessage);
        }
      });
    });
  }

  onStatusToggle (userId: string, isActive: boolean): void {
    const newStatus = isActive ? 'ACTIVE' : 'SUSPENDED';

    const user = this.allUsers().find(u => u.id === userId);
    if (!user || !user.walletId) {
      this.toast.error('User wallet not found');
      return;
    }

    this.adminApi.updateWalletStatus(user.walletId, newStatus).subscribe({
      next: () => {
        this.updateUsers(users => users.map(u => (u.id === userId ? { ...u, status: newStatus } : u)));
        this.toast.success(`Wallet status updated to ${newStatus}`);
      },
      error: (err: HttpError) => {
        const errorMessage = err?.error?.message ?? err?.message ?? 'Failed to update wallet status';
        this.toast.error(errorMessage);
      }
    });
  }

  loadDashboardData (): void {
    this.adminApi.getDashboardData().subscribe({
      next: dashboard => {
        this.setDashboardStats(dashboard.stats);

        const users: AdminUser[] = dashboard.users.map(user => {
          const { id, displayName: name, email, walletId, isEmailVerified, deletedAt } = user;

          const role = user.role as UserRole;
          const balance = Number(user.availableBalanceMinor ?? 0) + Number(user.reservedBalanceMinor ?? 0);
          const status = user.status ?? 'ACTIVE';
          const currency = user.currency ?? 'USD';

          return { id, name, email, role, status, balance, currency, walletId, isEmailVerified, deletedAt };
        });

        this.updateUsers(() => users);
        this.setLoading(false);
      },
      error: (err: HttpError) => {
        if (this.isAuthEnding()) {
          this.setLoading(false);
          return;
        }

        const errorMessage = err?.error?.message || (err?.message ? String(err.message) : 'Failed to load dashboard data');
        this.toast.error(errorMessage);
        this.setLoading(false);
      }
    });
  }
}
