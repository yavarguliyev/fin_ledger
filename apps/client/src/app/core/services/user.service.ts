import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

import { UpdateProfileRequest, UpdateProfileResponse, DeleteResponse, UploadRequest, GetImageUrl } from '../models/auth.model';
import { Wallet } from '../models/wallet.model';
import { WalletStatus } from '../models/base.mode';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { handleHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  updateProfile (request: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http.patch<UpdateProfileResponse>(`${this.apiUrl}/users`, request).pipe(
      tap(response => this.auth.updateUserSession(response)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  uploadImages (files: File[]): Observable<UploadRequest> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http
      .post<UploadRequest>(`${this.apiUrl}/users/upload`, formData)
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  getImageUrl (indexes?: number[]): Observable<GetImageUrl> {
    const params = indexes ? `?indexes=${indexes.join(',')}` : '';
    return this.http.get<GetImageUrl>(`${this.apiUrl}/users/images${params}`).pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  deleteImages (indexes?: number[]): Observable<void> {
    const params = indexes ? `?indexes=${indexes.join(',')}` : '';
    return this.http.delete<void>(`${this.apiUrl}/users/images${params}`).pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  updateWalletStatus (walletId: string, status: WalletStatus): Observable<Wallet> {
    return this.http
      .patch<Wallet>(`${this.apiUrl}/wallets/${walletId}/status`, { status })
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  deleteUser (userId: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.apiUrl}/users/${userId}`).pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  deleteUserFromDb (userId: string): Observable<DeleteResponse> {
    return this.http
      .delete<DeleteResponse>(`${this.apiUrl}/users/${userId}/from-db`)
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }

  updateEmailVerification (userId: string, isEmailVerified: boolean): Observable<unknown> {
    return this.http
      .patch(`${this.apiUrl}/users/${userId}/email-verification`, { isEmailVerified })
      .pipe(catchError((error: HttpErrorResponse) => handleHttpError(error)));
  }
}
