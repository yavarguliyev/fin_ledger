import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';

import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { INFO_PANEL } from '../../constants/info-panel.constant';
import { SupportLockStore } from '../../../../core/services/support-lock.store';
import { SupportPrivacyStore } from '../../../../core/services/support-privacy.store';

@Component({
  selector: 'app-info-setting',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../../templates/info/info-setting.component.html'
})
export class InfoSettingComponent {
  readonly privacy = inject(SupportPrivacyStore);
  readonly locks = inject(SupportLockStore);
  readonly page = input.required<string>();
  readonly card = INFO_DIALOG.CARD;
  readonly isPrivacy = computed(() => this.page() === INFO_DIALOG.PAGES.PRIVACY);
  readonly title = computed(() => (this.isPrivacy() ? INFO_PANEL.PRIVACY_TITLE : INFO_PANEL.LOCK_TITLE));
  readonly hint = computed(() => (this.isPrivacy() ? INFO_PANEL.PRIVACY_HINT : INFO_PANEL.LOCK_HINT));
  readonly checked = computed(() => (this.isPrivacy() ? this.privacy.enabled() : this.locks.activeLocked()));

  change (value: boolean): void {
    if (this.isPrivacy()) this.privacy.change(value);
    else if (value) this.locks.lock();
    else this.locks.removeLock();
  }
}
