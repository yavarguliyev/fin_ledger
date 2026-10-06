import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, forkJoin, map } from 'rxjs';

import { AdminDashboard } from '../interfaces/admin/admin-dashboard.interface';
import { AdminUserPage } from '../interfaces/admin/admin-user-page.interface';
import { AdminUserRowsDto } from '../interfaces/admin/admin-user-rows.interface';
import { AdminUserPageQuery } from '../interfaces/admin/admin-user-page-query.interface';
import { ADMIN_USERS_PAGE } from '../constants/admin/admin-users-page.constant';
import { BackendAdminDashboard } from '../interfaces/admin/backend-admin-dashboard.interface';
import { BackendUserWithWallet } from '../interfaces/admin/backend-user-with-wallet.interface';
import { CreateUserDto } from '../interfaces/admin/create-user-dto.interface';
import { CreateUserResponse } from '../interfaces/admin/create-user-response.interface';
import { UserWithWallet } from '../interfaces/admin/user-with-wallet.interface';
import { AppConfigService } from './app-config.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl (): string {
    return `${this.config.apiUrl}/admin`;
  }

  private get apiUrl (): string {
    return `${this.config.apiUrl}/users`;
  }

  createUser (dto: CreateUserDto): Observable<CreateUserResponse> {
    return this.http
      .post<CreateUserResponse>(this.apiUrl, dto)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  getDashboardData (): Observable<AdminDashboard> {
    return forkJoin({ dashboard: this.http.get<BackendAdminDashboard>(`${this.baseUrl}/dashboard`), page: this.getUsers({ limit: ADMIN_USERS_PAGE.SIZE }) }).pipe(
      map(({ dashboard, page }) => ({ stats: dashboard.stats, ...page }))
    );
  }

  getUsers ({ limit, before, beforeId }: AdminUserPageQuery): Observable<AdminUserPage> {
    const params = { limit: limit.toString(), ...(before && { before }), ...(beforeId && { beforeId }) };
    return this.http.get<BackendUserWithWallet[]>(`${this.baseUrl}/users`, { params }).pipe(map(rows => this.toPage({ rows, limit })));
  }

  private toPage ({ rows, limit }: AdminUserRowsDto): AdminUserPage {
    const last = rows.at(-1);
    const full = new Set(rows.map(row => row.id)).size === limit;
    return { users: rows.map(user => this.mapUser(user)), next: full && last ? { limit, before: last.created_at, beforeId: last.id } : null };
  }

  private mapUser (backendUser: BackendUserWithWallet): UserWithWallet {
    return {
      id: backendUser.id,
      email: backendUser.email,
      displayName: backendUser.display_name,
      role: backendUser.role,
      walletId: backendUser.wallet_id,
      isEmailVerified: backendUser.is_email_verified,
      deletedAt: backendUser.deleted_at,
      createdAt: backendUser.created_at,
      availableBalanceMinor: backendUser.available_balance_minor,
      reservedBalanceMinor: backendUser.reserved_balance_minor,
      currency: backendUser.currency,
      status: (backendUser.status?.toLowerCase() as 'active' | 'suspended' | 'closed' | null) ?? null,
      userStatus: backendUser.user_status
    };
  }
}
