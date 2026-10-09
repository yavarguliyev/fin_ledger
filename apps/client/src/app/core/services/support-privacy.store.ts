import { Injectable, computed, inject, signal } from '@angular/core';

import { MessageIdRefDto } from '../interfaces/support/message-id-ref.interface';
import { StreamEventRefDto } from '../interfaces/support/stream-event-ref.interface';
import { SUPPORT_PANEL } from '../constants/support/support-panel.constant';
import { SupportChatStore } from './support-chat.store';
import { SupportPanelApiService } from './support-panel-api.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportPrivacyStore {
  private readonly api = inject(SupportPanelApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);

  private readonly savingSignal = signal(false);

  readonly saving = this.savingSignal.asReadonly();
  readonly enabled = computed(() => this.chat.activeConversation()?.privacyEnabled ?? false);

  change (enabled: boolean): void {
    const conversationId = this.chat.activeId();
    if (!conversationId || this.savingSignal()) return;

    this.savingSignal.set(true);
    this.api.changePrivacy({ conversationId, enabled }).subscribe({
      next: () => {
        this.savingSignal.set(false);
        this.chat.loadConversations();
      },
      error: () => {
        this.savingSignal.set(false);
        this.toast.error(SUPPORT_PANEL.PRIVACY_FAILED);
      }
    });
  }

  download ({ messageId }: MessageIdRefDto): void {
    const conversationId = this.chat.activeId();
    if (!conversationId) return;

    this.api.download({ conversationId, messageId }).subscribe({
      next: ({ url }) => window.location.assign(url),
      error: () => this.toast.error(SUPPORT_PANEL.DOWNLOAD_FAILED)
    });
  }

  applyEvent ({ event }: StreamEventRefDto): void {
    if (event.type === SUPPORT_PANEL.CONVERSATION_UPDATED_EVENT && (event.privacyEnabled !== undefined || event.themeChanged)) this.chat.loadConversations();
  }
}
