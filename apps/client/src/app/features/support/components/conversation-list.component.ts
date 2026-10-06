import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SupportConversation } from '../../../core/types/support/support-conversation.type';

import { SUPPORT_MESSAGES } from '../../../core/constants/support/support-messages.constant';
import { SupportAvatarComponent } from './support-avatar.component';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, SupportAvatarComponent],
  templateUrl: '../templates/conversation-list.component.html'
})
export class ConversationListComponent {
  readonly conversations = input<SupportConversation[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly picked = output<string>();
  readonly labels = SUPPORT_MESSAGES;

  preview (conversation: SupportConversation): string {
    if (conversation.locked) return this.labels.LOCKED_PREVIEW;
    if (conversation.privacyEnabled) return this.labels.PRIVATE_PREVIEW;
    return conversation.lastMessagePreview ?? conversation.subject ?? this.labels.NO_MESSAGES;
  }
}
