import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';

import { PresenceEntry } from '../../../core/types/support/presence-entry.type';
import { PresenceHelper } from '../../../core/helpers/support/presence.helper';
import { SUPPORT_MESSAGES } from '../../../core/constants/support/support-messages.constant';
import { SupportAvatarComponent } from './support-avatar.component';
import { ChatRowBadgesComponent } from './chat-row-badges.component';
import { ChatRowPreviewComponent } from './chat-row-preview.component';
import { CHAT_FILTER } from '../../../core/constants/support/chat-filter.constant';
import { ChatFilter } from '../../../core/types/support/chat-filter.type';
import { ChatListHelper } from '../../../core/helpers/support/chat-list.helper';
import { ListTimeHelper } from '../helpers/list-time.helper';
import { SupportAvatarHelper } from '../helpers/support-avatar.helper';
import { SupportConversation } from '../../../core/types/support/support-conversation.type';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SupportAvatarComponent, ChatRowBadgesComponent, ChatRowPreviewComponent],
  templateUrl: '../templates/contact-list.component.html'
})
export class ContactListComponent {
  readonly contacts = input<PresenceEntry[]>([]);
  readonly conversations = input<SupportConversation[]>([]);
  readonly selectedStaffId = input<string | null>(null);
  readonly picked = output<string>();
  readonly filter = input<ChatFilter>(CHAT_FILTER.ALL);
  readonly labels = SUPPORT_MESSAGES;
  readonly filterLabels = CHAT_FILTER;
  readonly shown = computed(() => {
    const rows = this.contacts().map(contact => ({ contact, pinnedAt: this.conversationOf(contact)?.pinnedAt ?? '' }));
    const kept = rows.filter(row => ChatListHelper.matches({ conversation: this.conversationOf(row.contact), filter: this.filter() }));
    const pinned = kept.filter(row => row.pinnedAt).sort((a, b) => b.pinnedAt.localeCompare(a.pinnedAt));
    return [...pinned, ...kept.filter(row => !row.pinnedAt)].map(row => row.contact);
  });

  isOnline (contact: PresenceEntry): boolean {
    return PresenceHelper.isOnline({ presence: contact });
  }

  conversationOf (contact: PresenceEntry): SupportConversation | null {
    return this.conversations().find(item => item.assignedStaffId === contact.userId) ?? null;
  }

  time ({ lastMessageAt }: SupportConversation): string {
    return ListTimeHelper.label({ iso: lastMessageAt });
  }

  roleLabel (contact: PresenceEntry): string {
    return SupportAvatarHelper.roleLabel({ role: contact.role });
  }
}
