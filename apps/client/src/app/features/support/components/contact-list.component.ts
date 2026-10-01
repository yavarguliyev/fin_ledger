import { Component, input, output } from '@angular/core';

import { LastSeenHelper } from '../helpers/last-seen.helper';
import { PresenceEntry } from '../../../core/types/support/presence-entry.type';
import { PresenceHelper } from '../../../core/helpers/support/presence.helper';
import { SUPPORT_MESSAGES } from '../../../core/constants/support/support-messages.constant';
import { SUPPORT_VIEW } from '../constants/support-view.constant';
import { SupportAvatarComponent } from './support-avatar.component';
import { SupportAvatarHelper } from '../helpers/support-avatar.helper';
import { SupportConversation } from '../../../core/types/support/support-conversation.type';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [SupportAvatarComponent],
  templateUrl: '../templates/contact-list.component.html'
})
export class ContactListComponent {
  readonly contacts = input<PresenceEntry[]>([]);
  readonly conversations = input<SupportConversation[]>([]);
  readonly selectedStaffId = input<string | null>(null);
  readonly picked = output<string>();
  readonly labels = SUPPORT_MESSAGES;

  isOnline (contact: PresenceEntry): boolean {
    return PresenceHelper.isOnline({ presence: contact });
  }

  status (contact: PresenceEntry): string {
    return this.isOnline(contact) ? SUPPORT_VIEW.ONLINE_LABEL : LastSeenHelper.label({ iso: contact.lastSeenAt });
  }

  roleLabel (contact: PresenceEntry): string {
    return SupportAvatarHelper.roleLabel({ role: contact.role });
  }

  unread (contact: PresenceEntry): number {
    return this.conversations().find(item => item.assignedStaffId === contact.userId)?.unreadCount ?? 0;
  }
}
