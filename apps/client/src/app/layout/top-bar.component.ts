import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';

import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { NotificationService } from '../core/services/notification.service';
import { ProfileImageService } from '../core/services/profile-image.service';
import { WalletService } from '../core/services/wallet.service';
import { PageTitleService } from '../core/services/page-title.service';
import { TOP_BAR } from '../core/constants/layout/top-bar.constant';
import { IconComponent } from '../shared/components/icon/icon.component';
import { CurrencyFormatPipe } from '../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, IconComponent, CurrencyFormatPipe],
  templateUrl: './templates/top-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)', '(document:keydown.escape)': 'closeMenu()' }
})
export class TopBarComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly notifications = inject(NotificationService);
  private readonly profileImage = inject(ProfileImageService);
  private readonly walletService = inject(WalletService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly labels = TOP_BAR;
  readonly page = inject(PageTitleService).page;
  readonly isPlayer = this.auth.isPlayer;
  readonly roleLabel = this.auth.roleLabel;
  readonly wallet = this.walletService.wallet;
  readonly isDark = this.theme.isDark;
  readonly unread = this.notifications.unreadCount;
  readonly menuOpen = signal(false);
  readonly userName = computed(() => this.auth.currentUser()?.displayName ?? TOP_BAR.GUEST);
  readonly initial = computed(() => this.userName().charAt(0).toUpperCase());
  readonly bellLabel = computed(() => (this.unread() > 0 ? `${TOP_BAR.NOTIFICATIONS}, ${this.unread()} ${TOP_BAR.UNREAD}` : TOP_BAR.NOTIFICATIONS));

  ngOnInit (): void {
    if (this.isPlayer()) this.walletService.ensureWallets().pipe(catchError(() => EMPTY)).subscribe();
  }

  imageUrl (): string | null {
    return this.profileImage.getMainImageUrl();
  }

  toggleMenu (): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu (): void {
    this.menuOpen.set(false);
  }

  toggleTheme (): void {
    this.theme.toggle();
  }

  logout (): void {
    this.closeMenu();
    this.auth.logout();
  }

  onDocumentClick (event: MouseEvent): void {
    if (event.target instanceof Node && !this.host.nativeElement.contains(event.target)) this.closeMenu();
  }
}
