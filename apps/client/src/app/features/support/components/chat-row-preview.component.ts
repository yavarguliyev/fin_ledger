import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';

import { CHAT_ROW_PREVIEW } from '../../../core/constants/support/chat-row-preview.constant';
import { ChatRowPreviewHelper } from '../../../core/helpers/support/chat-row-preview.helper';
import { SupportChatStore } from '../../../core/services/support-chat.store';
import { SupportConversation } from '../../../core/types/support/support-conversation.type';

@Component({
  selector: 'app-chat-row-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/chat-row-preview.component.html',
  host: { class: 'flex min-w-0 flex-1 items-center gap-1 text-xs text-ink-500 dark:text-night-muted' }
})
export class ChatRowPreviewComponent {
  private readonly chat = inject(SupportChatStore);

  readonly conversation = input.required<SupportConversation>();
  readonly labels = CHAT_ROW_PREVIEW;
  readonly preview = computed(() => ChatRowPreviewHelper.describe({ conversation: this.conversation(), myUserId: this.chat.myUserId() }));
}
