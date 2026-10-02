import { Injectable, inject, signal } from '@angular/core';

import { ConversationRefDto } from '../interfaces/support/conversation-ref.interface';
import { StreamEventRefDto } from '../interfaces/support/stream-event-ref.interface';
import { SUPPORT } from '../constants/support/support.constant';
import { SupportApiService } from './support-api.service';
import { SupportChatStore } from './support-chat.store';

@Injectable({ providedIn: 'root' })
export class SupportTypingStore {
  private readonly api = inject(SupportApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly typingSignal = signal<ReadonlySet<string>>(new Set());
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly lastSent = new Map<string, number>();

  readonly typingIn = this.typingSignal.asReadonly();

  applyEvent ({ event }: StreamEventRefDto): void {
    const conversationId = event.conversationId;
    if (!conversationId) return;

    const fromPeer = (userId: string | null | undefined): boolean => !!userId && userId !== this.chat.myUserId();
    if (event.type === SUPPORT.TYPING_EVENT && fromPeer(event.typingUserId)) this.show({ conversationId });
    else if (fromPeer(event.message?.senderUserId)) this.hide({ conversationId });
  }

  notify ({ conversationId }: ConversationRefDto): void {
    const now = Date.now();
    if (now - (this.lastSent.get(conversationId) ?? 0) < SUPPORT.TYPING_SEND_EVERY_MS) return;

    this.lastSent.set(conversationId, now);
    this.api.typing({ conversationId }).subscribe({ error: () => undefined });
  }

  private show ({ conversationId }: ConversationRefDto): void {
    clearTimeout(this.timers.get(conversationId));
    this.timers.set(conversationId, setTimeout(() => this.hide({ conversationId }), SUPPORT.TYPING_SHOW_MS));
    this.typingSignal.set(new Set([...this.typingSignal(), conversationId]));
  }

  private hide ({ conversationId }: ConversationRefDto): void {
    clearTimeout(this.timers.get(conversationId));
    this.timers.delete(conversationId);
    if (!this.typingSignal().has(conversationId)) return;

    const next = new Set(this.typingSignal());
    next.delete(conversationId);
    this.typingSignal.set(next);
  }
}
