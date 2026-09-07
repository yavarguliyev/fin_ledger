import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { NotificationService } from '../core/services/notification.service';
import { ProfileImageService } from '../core/services/profile-image.service';
import { NavItem } from '../core/models/style.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './templates/shell.component.html'
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly notif = inject(NotificationService);
  readonly profileImageService = inject(ProfileImageService);

  readonly isDark = computed(() => this.theme.isDark());
  readonly unread = computed(() => this.notif.unreadCount());

  readonly navItems = computed(() => this.allNavItems.filter(item => !item.hideForRoles?.includes(this.auth.currentUser()?.role ?? '')));
  readonly mobileNav = computed(() => this.allMobileNavItems.filter(item => !item.hideForRoles?.includes(this.auth.currentUser()?.role ?? '')));

  private readonly allNavItems: NavItem[] = [
    { path: '/admin', label: 'Admin', icon: '👨🏻‍💻', hideForRoles: ['moderator', 'user'] },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/wallet', label: 'Wallet', icon: '👛' },
    { path: '/betting', label: 'Betting', icon: '🎯', hideForRoles: ['global admin', 'admin', 'moderator'] },
    { path: '/ledger', label: 'Ledger', icon: '📒' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  private readonly allMobileNavItems: NavItem[] = [
    { path: '/admin', label: 'Admin', icon: '👨🏻‍💻', hideForRoles: ['moderator', 'user'] },
    { path: '/dashboard', label: 'Home', icon: '📊' },
    { path: '/wallet', label: 'Wallet', icon: '👛' },
    { path: '/betting', label: 'Bet', icon: '🎯', hideForRoles: ['global admin', 'admin', 'moderator'] },
    { path: '/notifications', label: 'Alerts', icon: '🔔' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

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

  roleLabel (): string {
    const role = this.auth.currentUser()?.role ?? 'user';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  openProfileImage (): void {
    const url = this.getProfileImageUrl();
    if (url) window.open(url, '_blank');
  }
}
