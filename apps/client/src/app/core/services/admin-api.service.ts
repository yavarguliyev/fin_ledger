import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';

import { UserService } from './user.service';
import {
  AdminDashboard,
  BackendAdminDashboard,
  BackendUserWithWallet,
  CreateUserDto,
  CreateUserResponse,
  UserWithWallet
} from '../models/admin.model';
import { DeleteUserResponse } from '../models/admin.model';
import { WalletStatus } from '../models/base.mode';
import { handleHttpError } from '../utils/http-error.util';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly baseUrl = `${environment.apiUrl}/admin`;
  private readonly apiUrl = `${environment.apiUrl}/users`;

  createUser (dto: CreateUserDto): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.apiUrl, dto).pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  updateWalletStatus (walletId: string, status: WalletStatus): Observable<unknown> {
    return this.userService.updateWalletStatus(walletId, status);
  }

  deleteUser (userId: string): Observable<DeleteUserResponse> {
    return this.userService.deleteUser(userId);
  }

  deleteUserFromDb (userId: string): Observable<DeleteUserResponse> {
    return this.userService.deleteUserFromDb(userId);
  }

  updateEmailVerification (userId: string, isEmailVerified: boolean): Observable<unknown> {
    return this.userService.updateEmailVerification(userId, isEmailVerified);
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
      status: (backendUser.status?.toLowerCase() as 'active' | 'suspended' | 'closed' | null) ?? null
    };
  }
}
