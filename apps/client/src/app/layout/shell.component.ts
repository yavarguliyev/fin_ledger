import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
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
import { SupportPinsStore } from '../core/services/support-pins.store';
import { SidebarStateService } from '../core/services/sidebar-state.service';
import { CallOverlayComponent } from './call-overlay.component';
import { CallStateService } from '../core/services/call-state.service';
import { ConnectivityService } from '../core/services/connectivity.service';
import { ReceiptViewerComponent } from '../shared/components/receipt-viewer/receipt-viewer.component';
import { SHELL_LAYOUT } from '../core/constants/layout/shell-layout.constant';
import { IconComponent } from '../shared/components/icon/icon.component';
import { TopBarComponent } from './top-bar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, CallOverlayComponent, ReceiptViewerComponent, IconComponent, TopBarComponent],
  templateUrl: './templates/shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
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
  private readonly pins = inject(SupportPinsStore);
  readonly sidebar = inject(SidebarStateService);

  readonly chatUnread = computed(() => this.chat.totalUnread());
  readonly supportPath = SUPPORT.ROUTE;
  readonly selfExcludedUntil = this.auth.selfExcludedUntil;

  readonly navItems = computed(() => this.visible({ items: this.allNavItems }));
  readonly mobileNav = computed(() => this.visible({ items: this.allMobileNavItems }));

  private readonly allNavItems: NavItem[] = [
    { path: '/admin', label: 'Admin', icon: 'shield', roles: ROLE_SETS.ADMIN },
    { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { path: '/wallet', label: 'Wallet', icon: 'wallet' },
    { path: '/betting', label: 'Games', icon: 'gamepad', roles: ROLE_SETS.PLAYER, live: true },
    { path: '/ledger', label: 'Ledger', icon: 'ledger' },
    { path: '/support', label: 'Support', icon: 'message-circle' },
    { path: '/profile', label: 'Profile', icon: 'user' }
  ];

  private readonly allMobileNavItems: NavItem[] = [
    { path: '/admin', label: 'Admin', icon: 'shield', roles: ROLE_SETS.ADMIN },
    { path: '/dashboard', label: 'Home', icon: 'layout-dashboard' },
    { path: '/wallet', label: 'Wallet', icon: 'wallet' },
    { path: '/betting', label: 'Games', icon: 'gamepad', roles: ROLE_SETS.PLAYER },
    { path: '/support', label: 'Chat', icon: 'message-circle' },
    { path: '/notifications', label: 'Alerts', icon: 'bell' },
    { path: '/profile', label: 'Profile', icon: 'user' }
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
        this.pins.applyEvent({ event });
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

  private visible ({ items }: NavItemsRefDto): NavItem[] {
    const role = this.auth.currentUser()?.role;
    return items.filter(item => !item.roles || (!!role && item.roles.includes(role)));
  }

  skipToContent (event: Event): void {
    event.preventDefault();
    document.getElementById(SHELL_LAYOUT.MAIN_ID)?.focus();
  }
}
