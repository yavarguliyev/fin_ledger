import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { SupportConversation } from '../../../core/types/support/support-conversation.type';

import { SUPPORT_MESSAGES } from '../../../core/constants/support/support-messages.constant';
import { SupportAvatarComponent } from './support-avatar.component';
import { ChatRowBadgesComponent } from './chat-row-badges.component';
import { ChatRowPreviewComponent } from './chat-row-preview.component';
import { ListTimeHelper } from '../helpers/list-time.helper';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SupportAvatarComponent, ChatRowBadgesComponent, ChatRowPreviewComponent],
  templateUrl: '../templates/conversation-list.component.html'
})
export class ConversationListComponent {
  readonly conversations = input<SupportConversation[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly picked = output<string>();
  readonly labels = SUPPORT_MESSAGES;

  time ({ lastMessageAt }: SupportConversation): string {
    return ListTimeHelper.label({ iso: lastMessageAt });
  }
}
