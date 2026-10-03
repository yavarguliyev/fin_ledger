import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

import { DeleteResponse } from '../interfaces/auth/delete-response.interface';
import { GetImageUrl } from '../interfaces/auth/get-image-url.interface';
import { UpdateProfileRequest } from '../interfaces/auth/update-profile-request.interface';
import { UpdateProfileResponse } from '../interfaces/auth/update-profile-response.interface';
import { UploadRequest } from '../interfaces/auth/upload-request.interface';
import { Wallet } from '../types/wallet/wallet.type';
import { AuthService } from './auth.service';
import { AppConfigService } from './app-config.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { UpdateWalletStatusDto } from '../interfaces/wallet/update-wallet-status.interface';
import { UpdateEmailVerificationDto } from '../interfaces/user/update-email-verification.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private get apiUrl (): string {
    return this.config.apiUrl;
  }

  getCurrentUser (): Observable<UpdateProfileResponse> {
    return this.http.get<UpdateProfileResponse>(`${this.apiUrl}/users/me`).pipe(
      tap(response => this.auth.updateCurrentUser({ user: response.user })),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  updateProfile (request: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http.patch<UpdateProfileResponse>(`${this.apiUrl}/users`, request).pipe(
      tap(response => this.auth.updateCurrentUser({ user: response.user })),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  uploadImages (files: File[]): Observable<HttpEvent<UploadRequest>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http
      .post<UploadRequest>(`${this.apiUrl}/users/upload`, formData, { reportProgress: true, observe: 'events' })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  getImageUrl (indexes?: number[]): Observable<GetImageUrl> {
    const params = indexes ? `?indexes=${indexes.join(',')}` : '';
    return this.http
      .get<GetImageUrl>(`${this.apiUrl}/users/images${params}`)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  deleteImages (indexes?: number[]): Observable<void> {
    const params = indexes ? `?indexes=${indexes.join(',')}` : '';
    return this.http
      .delete<void>(`${this.apiUrl}/users/images${params}`)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  updateWalletStatus ({ walletId, status }: UpdateWalletStatusDto): Observable<Wallet> {
    return this.http
      .patch<Wallet>(`${this.apiUrl}/wallets/${walletId}/status`, { status })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  deleteUser (userId: string): Observable<DeleteResponse> {
    return this.http
      .delete<DeleteResponse>(`${this.apiUrl}/users/${userId}`)
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  anonymizeUser (userId: string): Observable<DeleteResponse> {
    return this.http
      .post<DeleteResponse>(`${this.apiUrl}/users/${userId}/anonymize`, {})
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  suspendUser (userId: string): Observable<unknown> {
    return this.http
      .post(`${this.apiUrl}/users/${userId}/suspend`, {})
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  reactivateUser (userId: string): Observable<unknown> {
    return this.http
      .post(`${this.apiUrl}/users/${userId}/reactivate`, {})
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  updateEmailVerification ({ userId, isEmailVerified }: UpdateEmailVerificationDto): Observable<unknown> {
    return this.http
      .patch(`${this.apiUrl}/users/${userId}/email-verification`, { isEmailVerified })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
