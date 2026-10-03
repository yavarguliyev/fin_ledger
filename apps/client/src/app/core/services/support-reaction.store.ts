import { Injectable, inject } from '@angular/core';

import { MESSAGE_REACTION } from '../constants/support/message-reaction.constant';
import { MessageReactionsDto } from '../interfaces/support/message-reactions.interface';
import { ReactionHelper } from '../helpers/support/reaction.helper';
import { ReactionToggleDto } from '../interfaces/support/reaction-toggle.interface';
import { StreamEventRefDto } from '../interfaces/support/stream-event-ref.interface';
import { SupportApiService } from './support-api.service';
import { SupportChatStore } from './support-chat.store';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportReactionStore {
  private readonly api = inject(SupportApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);

  toggle ({ messageId, emoji }: ReactionToggleDto): void {
    const conversationId = this.chat.activeId();
    const message = this.chat.messages().find(item => item.id === messageId);
    if (!conversationId || !message) return;

    const next = ReactionHelper.next({ reactions: message.reactions ?? [], myUserId: this.chat.myUserId(), emoji });
    this.api.react({ conversationId, messageId, emoji: next }).subscribe({
      next: reactions => this.apply({ messageId, reactions }),
      error: () => this.toast.error(MESSAGE_REACTION.FAILED)
    });
  }

  applyEvent ({ event }: StreamEventRefDto): void {
    if (event.type !== MESSAGE_REACTION.EVENT || !event.messageId || !event.reactions) return;
    if (event.conversationId !== this.chat.activeId()) return;
    this.apply({ messageId: event.messageId, reactions: event.reactions });
  }

  private apply ({ messageId, reactions }: MessageReactionsDto): void {
    const message = this.chat.messages().find(item => item.id === messageId);
    if (message) this.chat.upsertMessage({ message: { ...message, reactions } });
  }
}
