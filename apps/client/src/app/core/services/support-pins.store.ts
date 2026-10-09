import { Injectable, computed, inject, signal } from '@angular/core';

import { ConversationPinsDto } from '../interfaces/support/conversation-pins.interface';
import { ConversationRefDto } from '../interfaces/support/conversation-ref.interface';
import { MessageIdRefDto } from '../interfaces/support/message-id-ref.interface';
import { PinDurationChoiceDto } from '../interfaces/support/pin-duration-choice.interface';
import { SUPPORT_PANEL } from '../constants/support/support-panel.constant';
import { SUPPORT_PINS } from '../constants/support/support-pins.constant';
import { StreamEventRefDto } from '../interfaces/support/stream-event-ref.interface';
import { SupportChatStore } from './support-chat.store';
import { SupportMessage } from '../types/support/support-message.type';
import { SupportPinsApiService } from './support-pins-api.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportPinsStore {
  private readonly api = inject(SupportPinsApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);
  private readonly pinsSignal = signal<SupportMessage[]>([]);
  private readonly loadedForSignal = signal<string | null>(null);
  private readonly choosingSignal = signal<string | null>(null);

  readonly pins = computed(() => (this.loadedForSignal() === this.chat.activeId() ? this.pinsSignal() : []));
  readonly pinnedIds = computed(() => new Set(this.pins().map(message => message.id)));
  readonly choosing = this.choosingSignal.asReadonly();
  readonly labels = SUPPORT_PINS;

  load ({ conversationId }: ConversationRefDto): void {
    if (!conversationId) return;
    this.api.list({ conversationId }).subscribe({ next: pins => this.set({ conversationId, pins }), error: () => undefined });
  }

  choose ({ messageId }: MessageIdRefDto): void {
    this.choosingSignal.set(messageId);
  }

  cancel (): void {
    this.choosingSignal.set(null);
  }

  pin ({ duration }: PinDurationChoiceDto): void {
    const conversationId = this.chat.activeId();
    const messageId = this.choosingSignal();
    this.choosingSignal.set(null);
    if (!conversationId || !messageId) return;
    this.api.pin({ conversationId, messageId, duration }).subscribe({
      next: pins => this.set({ conversationId, pins }),
      error: () => this.toast.error(SUPPORT_PINS.PIN_FAILED)
    });
  }

  unpin ({ messageId }: MessageIdRefDto): void {
    const conversationId = this.chat.activeId();
    if (!conversationId) return;
    this.api.unpin({ conversationId, messageId }).subscribe({
      next: pins => this.set({ conversationId, pins }),
      error: () => this.toast.error(SUPPORT_PINS.UNPIN_FAILED)
    });
  }

  applyEvent ({ event }: StreamEventRefDto): void {
    if (event.type === SUPPORT_PANEL.CONVERSATION_UPDATED_EVENT && event.pinsChanged && event.conversationId === this.chat.activeId()) {
      this.load({ conversationId: event.conversationId });
    }
  }

  private set ({ conversationId, pins }: ConversationPinsDto): void {
    this.loadedForSignal.set(conversationId);
    this.pinsSignal.set(pins);
  }
}
