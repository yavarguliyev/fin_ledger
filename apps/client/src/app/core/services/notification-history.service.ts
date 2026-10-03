import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { AppNotification } from '../types/notification/app-notification.type';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { NOTIFICATION_PAGE } from '../constants/notification/notification-page.constant';
import { NotificationService } from './notification.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class NotificationHistoryService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly notifications = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly hasMoreSignal = signal(false);
  private readonly loadingSignal = signal(false);

  readonly hasMore = this.hasMoreSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadFirst (): Observable<AppNotification[]> {
    return this.notifications.getNotifications(NOTIFICATION_PAGE.SIZE).pipe(tap(page => this.hasMoreSignal.set(page.length === NOTIFICATION_PAGE.SIZE)));
  }

  loadOlder (): void {
    const oldest = this.notifications.notifications().at(-1);
    if (!oldest || !this.hasMoreSignal() || this.loadingSignal()) return;

    this.loadingSignal.set(true);
    const params = {
      [NOTIFICATION_PAGE.LIMIT_PARAM]: String(NOTIFICATION_PAGE.SIZE),
      [NOTIFICATION_PAGE.BEFORE_PARAM]: oldest.createdAt,
      [NOTIFICATION_PAGE.BEFORE_ID_PARAM]: oldest.id
    };

    this.http
      .get<AppNotification[]>(`${this.config.apiUrl}${NOTIFICATION_PAGE.PATH}`, { params })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)))
      .subscribe({
        next: page => {
          this.notifications.appendOlder({ incoming: page });
          this.hasMoreSignal.set(page.length === NOTIFICATION_PAGE.SIZE);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.loadingSignal.set(false);
          this.toast.error(NOTIFICATION_PAGE.FAILED);
        }
      });
  }
}
