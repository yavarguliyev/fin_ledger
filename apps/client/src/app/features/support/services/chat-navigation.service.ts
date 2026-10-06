import { Injectable, inject } from '@angular/core';

import { CHAT_SEARCH } from '../constants/chat-search.constant';
import { ChatPeerService } from './chat-peer.service';
import { MessageRevealService } from './message-reveal.service';
import { StarredMessage } from '../../../core/interfaces/support/starred-message.interface';
import { SupportChatStore } from '../../../core/services/support-chat.store';
import { SupportComposeStore } from '../../../core/services/support-compose.store';
import { SupportLockStore } from '../../../core/services/support-lock.store';
import { SupportStarStore } from '../../../core/services/support-star.store';

@Injectable()
export class ChatNavigationService {
  private readonly chat = inject(SupportChatStore);
  private readonly compose = inject(SupportComposeStore);
  private readonly peer = inject(ChatPeerService);
  private readonly reveal = inject(MessageRevealService);
  private readonly locks = inject(SupportLockStore);
  private readonly stars = inject(SupportStarStore);

  pick (conversationId: string): void {
    this.compose.cancelEdit();
    if (this.locks.isBlocked({ conversationId })) return this.locks.open({ conversationId });

    this.chat.select({ conversationId });
    this.peer.track();
  }

  pickContact (staffUserId: string): void {
    this.compose.cancelEdit();
    const conversation = this.chat.conversations().find(item => item.assignedStaffId === staffUserId);
    if (conversation && this.locks.isBlocked({ conversationId: conversation.id })) return this.locks.open({ conversationId: conversation.id });

    this.chat.openWith({ staffUserId });
  }

  pickStarred ({ conversationId, messageId }: StarredMessage): void {
    this.stars.closeEverywhere();
    if (this.chat.activeId() !== conversationId) this.pick(conversationId);
    setTimeout(() => this.reveal.reveal({ messageId }), CHAT_SEARCH.RETRY_MS);
  }
}
