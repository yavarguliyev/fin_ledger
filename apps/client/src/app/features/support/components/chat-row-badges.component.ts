import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { CHAT_FILTER } from '../../../core/constants/support/chat-filter.constant';
import { SupportConversation } from '../../../core/types/support/support-conversation.type';

@Component({
  selector: 'app-chat-row-badges',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/chat-row-badges.component.html',
  host: { class: 'flex shrink-0 items-center gap-1.5' }
})
export class ChatRowBadgesComponent {
  readonly conversation = input<SupportConversation | null>(null);
  readonly labels = CHAT_FILTER;
}
