import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';

import { AdminDashboard } from '../interfaces/admin/admin-dashboard.interface';
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
    return this.http
      .get<BackendAdminDashboard>(`${this.baseUrl}/dashboard`)
      .pipe(map(response => ({ stats: response.stats, users: response.users.map(user => this.mapUser(user)) })));
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
