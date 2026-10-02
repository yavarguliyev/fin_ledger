import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { AppNotification } from '../types/notification/app-notification.type';
import { AppConfigService } from './app-config.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { SSE_RECONNECT } from '../constants/notification/sse.constant';
import { SSE_STREAM } from '../constants/notification/stream.constant';
import { StreamTicket } from '../interfaces/notification/stream-ticket.interface';
import { StreamTicketRefDto } from '../interfaces/notification/stream-ticket-ref.interface';
import { NotificationMergeHelper } from '../helpers/notification/notification-merge.helper';
import { SessionStore } from './session-store.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly store = inject(SessionStore);
  private readonly config = inject(AppConfigService);
  private readonly notificationsSignal = signal<AppNotification[]>([]);
  private readonly http = inject(HttpClient);
  private readonly zone = inject(NgZone);

  private eventSource: EventSource | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private stopped = false;
  private connecting = false;

  readonly notifications = computed(() => this.notificationsSignal());
  readonly unreadCount = computed(() => this.notificationsSignal().filter(n => n.status !== 'READ').length);

  private get apiUrl (): string {
    return `${this.config.apiUrl}/notifications`;
  }

  markAllRead (): void {
    this.notificationsSignal().forEach(notification => {
      if (notification.status !== 'READ') this.markAsRead(notification.id).subscribe();
    });
  }

  getNotifications (limit = 20): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}`, { params: { limit: limit.toString() } }).pipe(
      tap(notifications => this.notificationsSignal.set(notifications)),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  connectSSE (): void {
    if (this.eventSource) return;
    this.stopped = false;
    this.reconnectAttempt = 0;
    this.openStream();
  }

  disconnectSSE (): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
    this.closeStream();
  }

  markAsRead (notificationId: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(updatedNotification => {
        const current = this.notificationsSignal();
        const updated = current.map(n => (n.id === notificationId ? updatedNotification : n));
        this.notificationsSignal.set(updated);
      }),
      catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error))
    );
  }

  private closeStream (): void {
    if (!this.eventSource) return;
    this.eventSource.close();
    this.eventSource = null;
  }

  private catchUp (): void {
    this.http.get<AppNotification[]>(`${this.apiUrl}`, { params: { limit: SSE_RECONNECT.CATCH_UP_LIMIT.toString() } }).subscribe({
      next: fetched => {
        this.zone.run(() => this.notificationsSignal.set(NotificationMergeHelper.merge({ current: this.notificationsSignal(), incoming: fetched })));
      },
      error: () => undefined
    });
  }

  private scheduleReconnect (): void {
    this.closeStream();

    if (this.stopped || this.reconnectTimer) return;

    this.reconnectAttempt += 1;

    const delay = NotificationMergeHelper.backoffMs({ attempt: this.reconnectAttempt });
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.stopped) this.openStream();
    }, delay);
  }

  private openStream (): void {
    if (!this.store.token() || this.connecting) return;

    this.connecting = true;

    this.http.post<StreamTicket>(`${this.apiUrl}${SSE_STREAM.TICKET_PATH}`, {}).subscribe({
      next: ({ ticket }) => this.attachStream({ ticket }),
      error: () => {
        this.connecting = false;
        this.scheduleReconnect();
      }
    });
  }

  private attachStream ({ ticket }: StreamTicketRefDto): void {
    this.connecting = false;
    if (this.stopped) return;

    const query = `${SSE_STREAM.TICKET_PARAM}=${encodeURIComponent(ticket)}`;
    this.eventSource = new EventSource(`${this.apiUrl}${SSE_STREAM.STREAM_PATH}?${query}`);

    this.eventSource.onopen = (): void => {
      const reconnected = this.reconnectAttempt > 0;
      this.reconnectAttempt = 0;
      if (reconnected) this.catchUp();
    };

    this.eventSource.onmessage = (event: MessageEvent): void => {
      this.zone.run(() => {
        const notification = JSON.parse(event.data as string) as AppNotification;
        this.notificationsSignal.set(NotificationMergeHelper.merge({ current: this.notificationsSignal(), incoming: [notification] }));
      });
    };

    this.eventSource.onerror = (): void => this.scheduleReconnect();
  }
}
