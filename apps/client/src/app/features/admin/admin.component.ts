import { Component, signal, computed, OnInit, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorMessageHelper } from '../../core/helpers/http/error-message.helper';

import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { UserDetailModalComponent } from './user-detail-modal.component';
import { CreateUserModalComponent } from './create-user-modal.component';
import { DataTableConfig } from '../../core/interfaces/ui/data-table-config.interface';
import { HttpError } from '../../core/interfaces/http/http-error.interface';
import { PaginationConfig } from '../../core/interfaces/ui/pagination-config.interface';
import { StatCard } from '../../core/interfaces/ui/stat-card.interface';
import { AdminUser } from '../../core/interfaces/admin/admin-user.interface';
import { CreateUserResponse } from '../../core/interfaces/admin/create-user-response.interface';
import { DashboardStats } from '../../core/interfaces/admin/dashboard-stats.interface';
import { UserData } from '../../core/interfaces/admin/user-data.interface';
import { UserService } from '../../core/services/user.service';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminHandlers } from './admin-handlers';
import { AdminHelper } from './helpers/admin.helper';

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
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly handlers: AdminHandlers;

  readonly allUsers = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly dashboardStats = signal<DashboardStats | null>(null);
  readonly selectedUser = signal<AdminUser | null>(null);
  readonly showCreateModal = signal(false);
  readonly createUserModalComponent = viewChild(CreateUserModalComponent);

  readonly isGlobalAdmin = this.authService.isGlobalAdmin;
  readonly currentUserId = computed(() => this.authService.currentUser()?.id ?? null);
  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly totalItems = computed(() => this.allUsers().length);

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
    availablePageSizes: [10, 25, 50, 100]
  }));

  readonly stats = computed<StatCard[]>(() => AdminHelper.buildStatCards({ stats: this.dashboardStats() }));

  readonly tableConfig = computed<DataTableConfig<AdminUser>>(() => ({
    title: 'User Management',
    showFilters: false,
    showExport: false,
    emptyMessage: 'No users',
    showCreateButton: this.isGlobalAdmin(),
    onCreateClick: this.openCreateModal.bind(this),
    columns: AdminHelper.getAdminTableColumns({
      onStatusToggle: this.handlers.onStatusToggle.bind(this.handlers),
      onEmailVerificationToggle: this.handlers.onEmailVerificationToggle.bind(this.handlers),
      onDeletedToggle: this.handlers.onDeletedToggle.bind(this.handlers),
      onView: this.handlers.onView.bind(this.handlers),
      onAnonymize: this.handlers.onAnonymize.bind(this.handlers),
      onAccountStatusToggle: this.handlers.onAccountStatusToggle.bind(this.handlers),
      isGlobalAdmin: this.isGlobalAdmin(),
      currentUserId: this.currentUserId()
    })
  }));

  constructor () {
    this.handlers = new AdminHandlers(
      this.adminApi,
      this.userService,
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
        const errorMessage = ErrorMessageHelper.from({ error: err, fallback: 'Failed to create user' });
        this.toast.error(errorMessage);
      }
    });
  }
}
