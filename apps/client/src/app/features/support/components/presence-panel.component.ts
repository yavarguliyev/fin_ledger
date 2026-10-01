import { Component, input } from '@angular/core';
import { PresenceEntry } from '../../../core/types/support/presence-entry.type';

import { SUPPORT_MESSAGES } from '../../../core/constants/support/support-messages.constant';
import { SUPPORT_VIEW } from '../constants/support-view.constant';
import { SupportAvatarHelper } from '../helpers/support-avatar.helper';
import { SupportAvatarComponent } from './support-avatar.component';

@Component({
  selector: 'app-presence-panel',
  standalone: true,
  imports: [SupportAvatarComponent],
  templateUrl: '../templates/presence-panel.component.html'
})
export class PresencePanelComponent {
  readonly entries = input<PresenceEntry[]>([]);
  readonly labels = SUPPORT_MESSAGES;
  readonly view = SUPPORT_VIEW;

  isOnline (entry: PresenceEntry): boolean {
    return entry.state !== SUPPORT_VIEW.OFFLINE;
  }

  roleLabel (entry: PresenceEntry): string {
    return SupportAvatarHelper.roleLabel({ role: entry.role });
  }
}
