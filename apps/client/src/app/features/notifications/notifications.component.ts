import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../core/services/notification.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { AppNotification } from '../../core/types/notification/app-notification.type';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PaginationConfig } from '../../core/interfaces/ui/pagination-config.interface';
import { NotificationType } from '../../core/types/notification/notification-type.type';
import {
  NOTIFICATION_CLASSES,
  NOTIFICATION_ICONS,
  NOTIFICATION_DISPLAY_FALLBACK
} from '../../core/constants/notification/notification-display.constant';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RelativeTimePipe, PaginationComponent],
  templateUrl: './templates/notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  private readonly notif = inject(NotificationService);

  readonly activeFilter = signal<string>('All');
  readonly filters = ['All', 'Unread', 'Read'];
  readonly unread = computed(() => this.notif.unreadCount());

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly totalItems = computed(() => this.filtered().length);

  readonly paginatedNotifications = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    currentPage: this.currentPage(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
    availablePageSizes: [10, 25, 50, 100]
  }));

  readonly filtered = computed(() => {
    const f = this.activeFilter();
    const list = this.notif.notifications();
    if (f === 'Unread') return list.filter(n => n.status !== 'READ');
    if (f === 'Read') return list.filter(n => n.status === 'READ');
    return list;
  });

  onPageChange (page: number): void {
    this.currentPage.set(page);
  }

  markAll (): void {
    this.notif.markAllRead();
  }

  ngOnInit (): void {
    this.notif.getNotifications(100).subscribe();
  }

  markOne (n: AppNotification): void {
    this.notif.markAsRead(n.id).subscribe();
  }

  setFilter (f: string): void {
    this.activeFilter.set(f);
    this.currentPage.set(1);
  }

  onPageSizeChange (size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  typeIcon (type: NotificationType): string {
    return NOTIFICATION_ICONS[type] ?? NOTIFICATION_DISPLAY_FALLBACK.ICON;
  }

  typeClass (type: NotificationType): string {
    return NOTIFICATION_CLASSES[type] ?? NOTIFICATION_DISPLAY_FALLBACK.CLASS;
  }
}
