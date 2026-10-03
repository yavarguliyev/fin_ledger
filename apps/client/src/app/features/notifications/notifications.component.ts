import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../core/services/notification.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { AppNotification } from '../../core/types/notification/app-notification.type';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PaginationConfig } from '../../core/interfaces/ui/pagination-config.interface';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';
import { LOAD_STATUS } from '../../core/constants/ui/load-status.constant';
import { LoadStatus } from '../../core/types/ui/load-status.type';
import { NotificationHistoryService } from '../../core/services/notification-history.service';
import { NOTIFICATION_PAGE } from '../../core/constants/notification/notification-page.constant';
import { NotificationType } from '../../core/types/notification/notification-type.type';
import {
  NOTIFICATION_CLASSES,
  NOTIFICATION_ICONS,
  NOTIFICATION_DISPLAY_FALLBACK
} from '../../core/constants/notification/notification-display.constant';

@Component({
  selector: 'app-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RelativeTimePipe, PaginationComponent, SkeletonComponent, EmptyStateComponent, ErrorStateComponent],
  templateUrl: './templates/notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  private readonly notif = inject(NotificationService);
  readonly history = inject(NotificationHistoryService);
  readonly pageLabels = NOTIFICATION_PAGE;

  readonly activeFilter = signal<string>('All');
  readonly status = signal<LoadStatus>(LOAD_STATUS.LOADING);
  readonly statuses = LOAD_STATUS;
  readonly states = LOAD_STATE;
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
    this.load();
  }

  load (): void {
    this.status.set(LOAD_STATUS.LOADING);
    this.history.loadFirst().subscribe({
      next: () => this.status.set(LOAD_STATUS.READY),
      error: () => this.status.set(LOAD_STATUS.ERROR)
    });
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
