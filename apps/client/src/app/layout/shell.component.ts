import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { NotificationService } from '../core/services/notification.service';
import { ProfileImageService } from '../core/services/profile-image.service';
import { NavItem } from '../core/interfaces/ui/nav-item.interface';
import { NavItemsRefDto } from '../core/interfaces/ui/nav-items-ref.interface';
import { ROLE_SETS } from '../core/constants/auth/role-sets.constant';
import { SUPPORT } from '../core/constants/support/support.constant';
import { SupportChatStore } from '../core/services/support-chat.store';
import { SupportPresenceStore } from '../core/services/support-presence.store';
import { SupportStreamService } from '../core/services/support-stream.service';
import { SupportCallStore } from '../core/services/support-call.store';
import { SupportTypingStore } from '../core/services/support-typing.store';
import { SupportOfflineQueueStore } from '../core/services/support-offline-queue.store';
import { SupportReactionStore } from '../core/services/support-reaction.store';
import { SupportPrivacyStore } from '../core/services/support-privacy.store';
import { CallOverlayComponent } from './call-overlay.component';
import { CallStateService } from '../core/services/call-state.service';
import { ConnectivityService } from '../core/services/connectivity.service';
import { ReceiptViewerComponent } from '../shared/components/receipt-viewer/receipt-viewer.component';
import { SHELL_LAYOUT } from '../core/constants/layout/shell-layout.constant';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, CallOverlayComponent, ReceiptViewerComponent, NgOptimizedImage],
  templateUrl: './templates/shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly notif = inject(NotificationService);
  readonly profileImageService = inject(ProfileImageService);
  readonly layout = SHELL_LAYOUT;
  private readonly chat = inject(SupportChatStore);
  private readonly chatStream = inject(SupportStreamService);
  private readonly presenceStore = inject(SupportPresenceStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly calls = inject(SupportCallStore);
  readonly callBusy = inject(CallStateService).busy;
  readonly connectivity = inject(ConnectivityService);
  private readonly typing = inject(SupportTypingStore);
  private readonly offlineQueue = inject(SupportOfflineQueueStore);
  private readonly reactions = inject(SupportReactionStore);
  private readonly privacy = inject(SupportPrivacyStore);

  readonly isDark = computed(() => this.theme.isDark());
  readonly unread = computed(() => this.notif.unreadCount());
  readonly chatUnread = computed(() => this.chat.totalUnread());
  readonly supportPath = SUPPORT.ROUTE;
  readonly roleLabel = this.auth.roleLabel;
  readonly selfExcludedUntil = this.auth.selfExcludedUntil;

  readonly navItems = computed(() => this.visible({ items: this.allNavItems }));
  readonly mobileNav = computed(() => this.visible({ items: this.allMobileNavItems }));

  private readonly allNavItems: NavItem[] = [
    { path: '/admin', label: 'Admin', icon: '👨🏻‍💻', roles: ROLE_SETS.ADMIN },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/wallet', label: 'Wallet', icon: '👛' },
    { path: '/betting', label: 'Betting', icon: '🎯', roles: ROLE_SETS.PLAYER },
    { path: '/ledger', label: 'Ledger', icon: '📒' },
    { path: '/support', label: 'Support', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  private readonly allMobileNavItems: NavItem[] = [
    { path: '/admin', label: 'Admin', icon: '👨🏻‍💻', roles: ROLE_SETS.ADMIN },
    { path: '/dashboard', label: 'Home', icon: '📊' },
    { path: '/wallet', label: 'Wallet', icon: '👛' },
    { path: '/betting', label: 'Bet', icon: '🎯', roles: ROLE_SETS.PLAYER },
    { path: '/support', label: 'Chat', icon: '💬' },
    { path: '/notifications', label: 'Alerts', icon: '🔔' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  ngOnInit (): void {
    this.chat.loadConversations();
    this.presenceStore.heartbeat();
    this.presenceStore.loadContacts();
    this.offlineQueue.listen();
    this.chatStream.connect({
      onMessage: event => {
        this.chat.applyStreamEvent(event);
        this.presenceStore.applyEvent({ event });
        this.calls.applyEvent({ event });
        this.typing.applyEvent({ event });
        this.reactions.applyEvent({ event });
        this.privacy.applyEvent({ event });
      },
      onReconnect: () => {
        this.chat.loadConversations();
        this.chat.resync();
        this.presenceStore.loadContacts();
        this.offlineQueue.flush();
      }
    });

    const heartbeat = setInterval(() => this.presenceStore.heartbeat(), SUPPORT.HEARTBEAT_MS);
    this.destroyRef.onDestroy(() => clearInterval(heartbeat));
  }

  userName (): string {
    return this.auth.currentUser()?.displayName ?? 'Guest';
  }

  initial (): string {
    return this.userName().charAt(0).toUpperCase();
  }

  getProfileImageUrl (): string | null {
    return this.profileImageService.getMainImageUrl();
  }

  toggleTheme (): void {
    this.theme.toggle();
  }

  logout (): void {
    this.auth.logout();
  }

  openProfileImage (): void {
    const url = this.getProfileImageUrl();
    if (url) window.open(url, '_blank');
  }

  private visible ({ items }: NavItemsRefDto): NavItem[] {
    const role = this.auth.currentUser()?.role;
    return items.filter(item => !item.roles || (!!role && item.roles.includes(role)));
  }

  skipToContent (event: Event): void {
    event.preventDefault();
    document.getElementById(SHELL_LAYOUT.MAIN_ID)?.focus();
  }
}
