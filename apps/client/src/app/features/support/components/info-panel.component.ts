import { Component, ChangeDetectionStrategy, computed, inject, input, output } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { INFO_PANEL } from '../constants/info-panel.constant';
import { LoadOnScrollDirective } from '../../../shared/directives/load-on-scroll.directive';
import { RoleHelper } from '../../../core/helpers/auth/role.helper';
import { SessionStore } from '../../../core/services/session-store.service';
import { SUPPORT_ATTACHMENT } from '../../../core/constants/support/support-attachment.constant';
import { SUPPORT_PANEL } from '../../../core/constants/support/support-panel.constant';
import { SupportAttachmentHelper } from '../../../core/helpers/support/support-attachment.helper';
import { SupportAvatarComponent } from './support-avatar.component';
import { SupportMessage } from '../../../core/types/support/support-message.type';
import { SupportPanelStore } from '../../../core/services/support-panel.store';
import { SupportStarStore } from '../../../core/services/support-star.store';
import { SupportStorageStore } from '../../../core/services/support-storage.store';
import { TABS } from '../../../core/constants/ui/tabs.constant';
import { TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { SupportPrivacyStore } from '../../../core/services/support-privacy.store';
import { SupportLockStore } from '../../../core/services/support-lock.store';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgOptimizedImage, RouterLink, LoadOnScrollDirective, SupportAvatarComponent, TabsComponent, ButtonComponent, ToggleComponent],
  templateUrl: '../templates/info-panel.component.html',
  host: { '(document:keydown.escape)': 'panel.hide()' }
})
export class InfoPanelComponent {
  private readonly session = inject(SessionStore);

  readonly panel = inject(SupportPanelStore);
  readonly stars = inject(SupportStarStore);
  readonly storage = inject(SupportStorageStore);
  readonly privacy = inject(SupportPrivacyStore);
  readonly locks = inject(SupportLockStore);
  readonly online = input(false);
  readonly status = input('');
  readonly jump = output<string>();
  readonly labels = INFO_PANEL;
  readonly tabIds = SUPPORT_PANEL.TABS;
  readonly tabStyles = TABS;
  readonly isAdmin = computed(() => RoleHelper.isAdmin({ role: this.session.user()?.role }));
  readonly emptyText = computed(() => INFO_PANEL.EMPTY[this.panel.tab() as keyof typeof INFO_PANEL.EMPTY]);

  size (bytes: number): string {
    return SupportAttachmentHelper.formatSize({ bytes });
  }

  isImage (message: SupportMessage): boolean {
    return message.kind === SUPPORT_ATTACHMENT.IMAGE_KIND;
  }

  fileLabel (message: SupportMessage): string {
    if (message.kind === SUPPORT_ATTACHMENT.VOICE_KIND) return INFO_PANEL.VOICE_NAME;
    return message.attachment?.fileName ?? INFO_PANEL.ATTACHMENT_LABEL;
  }

  go (messageId: string): void {
    this.jump.emit(messageId);
    if (!window.matchMedia(SUPPORT_PANEL.DESKTOP_QUERY).matches) this.panel.hide();
  }
}
