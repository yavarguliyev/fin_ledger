import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ChatActionsService } from '../../services/chat-actions.service';
import { ChatSearchService } from '../../services/chat-search.service';
import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { INFO_PANEL } from '../../constants/info-panel.constant';
import { InfoNavService } from '../../services/info-nav.service';
import { ProfilePhotoService } from '../../services/profile-photo.service';
import { PROFILE_PHOTO } from '../../constants/profile-photo.constant';
import { InfoRowComponent } from './info-row.component';
import { InfoPreferencesComponent } from './info-preferences.component';
import { RoleHelper } from '../../../../core/helpers/auth/role.helper';
import { SessionStore } from '../../../../core/services/session-store.service';
import { SUPPORT_CALL } from '../../../../core/constants/support/support-call.constant';
import { SupportAttachmentHelper } from '../../../../core/helpers/support/support-attachment.helper';
import { SupportAvatarComponent } from '../support-avatar.component';
import { SupportLockStore } from '../../../../core/services/support-lock.store';
import { SupportPanelStore } from '../../../../core/services/support-panel.store';
import { SupportPrivacyStore } from '../../../../core/services/support-privacy.store';
import { SupportStarStore } from '../../../../core/services/support-star.store';
import { SupportStorageStore } from '../../../../core/services/support-storage.store';

@Component({
  selector: 'app-info-main',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, InfoRowComponent, InfoPreferencesComponent, SupportAvatarComponent],
  templateUrl: '../../templates/info/info-main.component.html'
})
export class InfoMainComponent {
  private readonly session = inject(SessionStore);
  private readonly actions = inject(ChatActionsService);
  private readonly search = inject(ChatSearchService);

  readonly nav = inject(InfoNavService);
  readonly photos = inject(ProfilePhotoService);
  readonly photoLabels = PROFILE_PHOTO;
  readonly panel = inject(SupportPanelStore);
  readonly stars = inject(SupportStarStore);
  readonly storage = inject(SupportStorageStore);
  readonly privacy = inject(SupportPrivacyStore);
  readonly locks = inject(SupportLockStore);
  readonly online = input(false);
  readonly status = input('');
  readonly labels = INFO_DIALOG;
  readonly adminRoute = INFO_PANEL.ADMIN_ROUTE;
  readonly pages = INFO_DIALOG.PAGES;
  readonly isAdmin = computed(() => RoleHelper.isAdmin({ role: this.session.user()?.role }));
  readonly name = computed(() => this.panel.contact()?.name ?? this.panel.contact()?.team ?? null);
  readonly subtitle = computed(() => {
    const contact = this.panel.contact();
    if (!contact) return '';
    if (contact.isStaff) return contact.team ?? INFO_DIALOG.STAFF_SUBTITLE;
    return contact.role ?? INFO_DIALOG.CUSTOMER_SUBTITLE;
  });
  readonly sharedCount = computed(() => this.storage.summary()?.fileCount ?? null);
  readonly starredCount = computed(() => this.stars.starred().length || INFO_DIALOG.NONE);
  readonly storageSize = computed(() => SupportAttachmentHelper.formatSize({ bytes: this.storage.summary()?.totalBytes ?? 0 }));

  voice (): void {
    this.actions.call(SUPPORT_CALL.AUDIO);
    this.nav.close();
  }

  video (): void {
    this.actions.call(SUPPORT_CALL.VIDEO);
    this.nav.close();
  }

  find (): void {
    this.nav.close();
    if (!this.search.open()) this.search.toggle();
  }
}
