import { Component, signal, computed, OnInit, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { UserDetailModalComponent } from './user-detail-modal.component';
import { CreateUserModalComponent } from './create-user-modal.component';
import { DataTableConfig } from '../../core/models/data-table.model';
import { StatCard, PaginationConfig, HttpError } from '../../core/models/base.mode';
import { AdminUser, CreateUserResponse, DashboardStats, UserData } from '../../core/models/admin.model';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { getAdminTableColumns, formatCurrencyCompact } from './admin.util';
import { AdminHandlers } from './admin-handlers';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    StatsCardComponent,
    PageHeaderComponent,
    ModalComponent,
    UserDetailModalComponent,
    CreateUserModalComponent
  ],
  templateUrl: './templates/admin.component.html'
})
export class AdminComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly handlers: AdminHandlers;

  readonly allUsers = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly dashboardStats = signal<DashboardStats | null>(null);
  readonly selectedUser = signal<AdminUser | null>(null);
  readonly showCreateModal = signal(false);
  readonly createUserModalComponent = viewChild(CreateUserModalComponent);

  readonly isGlobalAdmin = computed(() => this.authService.currentUser()?.role === 'global admin');

  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly totalItems = computed(() => this.allUsers().length);

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
    availablePageSizes: [10, 25, 50, 100]
  }));

  readonly stats = computed<StatCard[]>(() => {
    const stats = this.dashboardStats();

    const definitions = [
      { label: 'Total Users', icon: '👥', value: stats?.totalUsers },
      { label: 'Active Wallets', icon: '👛', value: stats?.activeWallets },
      { label: 'Total Volume', icon: '💰', value: stats?.totalVolumeMinor },
      { label: 'Pending', icon: '⏳', value: stats?.pending }
    ];

    return definitions.map(({ label, icon, value }) => ({
      label,
      icon,
      value: value == null ? (label === 'Total Volume' ? '$0' : '0') : label === 'Total Volume' ? formatCurrencyCompact(value) : String(value)
    }));
  });

  readonly tableConfig = computed<DataTableConfig<AdminUser>>(() => ({
    title: 'User Management',
    showFilters: false,
    showExport: false,
    emptyMessage: 'No users',
    showCreateButton: this.isGlobalAdmin(),
    onCreateClick: this.openCreateModal.bind(this),
    columns: getAdminTableColumns(
      this.handlers.onStatusToggle.bind(this.handlers),
      this.handlers.onEmailVerificationToggle.bind(this.handlers),
      this.handlers.onDeletedToggle.bind(this.handlers),
      this.handlers.onView.bind(this.handlers),
      this.handlers.onDelete.bind(this.handlers),
      this.isGlobalAdmin()
    )
  }));

  constructor () {
    this.handlers = new AdminHandlers(
      this.adminApi,
      this.toast,
      this.allUsers,
      this.allUsers.update.bind(this.allUsers),
      this.dashboardStats.set.bind(this.dashboardStats),
      this.loading.set.bind(this.loading),
      this.selectedUser.set.bind(this.selectedUser),
      () => !this.authService.isAuthenticated() || this.authService.isLoggingOut()
    );
  }

  ngOnInit (): void {
    this.handlers.loadDashboardData();
  }

  closeModal (): void {
    this.selectedUser.set(null);
  }

  openCreateModal (): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal (): void {
    this.showCreateModal.set(false);
  }

  onPageChange (page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange (size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onCreateUser (userData: UserData): void {
    this.adminApi.createUser(userData).subscribe({
      next: (response: CreateUserResponse) => {
        this.toast.success(response.message);
        this.createUserModalComponent()?.resetForm();
        this.closeCreateModal();
        this.handlers.loadDashboardData();
      },
      error: (err: HttpError) => {
        this.createUserModalComponent()?.loading.set(false);
        const errorMessage = err?.error?.message ?? err?.message ?? err?.statusText ?? 'Failed to create user';
        this.toast.error(errorMessage);
      }
    });
  }
}
