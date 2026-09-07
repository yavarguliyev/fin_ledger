import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { AppNotification } from '../models/notification.model';
import { environment } from '../../../environments/environment';
import { handleHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private readonly notificationsSignal = signal<AppNotification[]>([]);
  private readonly http = inject(HttpClient);
  private readonly zone = inject(NgZone);

  private eventSource: EventSource | null = null;

  readonly notifications = computed(() => this.notificationsSignal());
  readonly unreadCount = computed(() => this.notificationsSignal().filter(n => n.status !== 'READ').length);

  markAllRead (): void {
    this.notificationsSignal().forEach(notification => {
      if (notification.status !== 'READ') this.markAsRead(notification.id).subscribe();
    });
  }

  getNotifications (limit = 20): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}`, { params: { limit: limit.toString() } }).pipe(
      tap(notifications => this.notificationsSignal.set(notifications)),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  disconnectSSE (): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  markAsRead (notificationId: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(updatedNotification => {
        const current = this.notificationsSignal();
        const updated = current.map(n => (n.id === notificationId ? updatedNotification : n));
        this.notificationsSignal.set(updated);
      }),
      catchError((error: HttpErrorResponse) => handleHttpError(error))
    );
  }

  connectSSE (): void {
    if (this.eventSource) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    this.eventSource = new EventSource(`${this.apiUrl}/stream?token=${encodeURIComponent(token)}`);
    this.eventSource.onmessage = (event: MessageEvent): void => {
      this.zone.run(() => {
        const notification = JSON.parse(event.data as string) as AppNotification;
        const current = this.notificationsSignal();
        this.notificationsSignal.set([notification, ...current]);
      });
    };

    this.eventSource.onerror = (): void => this.disconnectSSE();
  }
}
