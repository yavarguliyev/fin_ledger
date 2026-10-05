import { ChangeDetectionStrategy, Component, inject, computed, OnInit, effect, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ShellComponent } from './layout/shell.component';
import { ToastHostComponent } from './layout/toast.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ShellComponent, ToastHostComponent],
  templateUrl: './shared/templates/app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  readonly isAuthenticated = computed(() => this.auth.isAuthenticated());

  constructor () {
    effect(() => {
      const authenticated = this.isAuthenticated();

      untracked(() => {
        if (authenticated) {
          this.notificationService.connectSSE();
          this.notificationService.getNotifications().subscribe();
        } else this.notificationService.disconnectSSE();
      });
    });
  }

  ngOnInit (): void {}
}
