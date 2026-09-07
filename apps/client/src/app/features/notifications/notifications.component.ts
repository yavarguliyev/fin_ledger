import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../core/services/notification.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { AppNotification } from '../../core/models/notification.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PaginationConfig } from '../../core/models/base.mode';

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

  typeIcon (type: string): string {
    const map: Record<string, string> = { payment: '💳', wallet: '👛', system: '⚙️', bet: '🎯' };
    return map[type] ?? '🔔';
  }

  typeClass (type: string): string {
    const map: Record<string, string> = {
      payment: 'bg-success/10 text-success',
      wallet: 'bg-primary/10 text-primary',
      system: 'bg-ink-100 text-ink-500',
      bet: 'bg-warning/10 text-warning'
    };

    return map[type] ?? 'bg-ink-100 text-ink-500';
  }
}
