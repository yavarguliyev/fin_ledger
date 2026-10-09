import { Injectable, inject, signal } from '@angular/core';

import { BulkDeleteDto } from '../interfaces/support/bulk-delete.interface';
import { KeepStarredDto } from '../interfaces/support/keep-starred.interface';
import { MessageRulesHelper } from '../helpers/support/message-rules.helper';
import { SUPPORT_HISTORY } from '../constants/support/support-history.constant';
import { SUPPORT_MESSAGE_RULES } from '../constants/support/support-message-rules.constant';
import { SupportChatStore } from './support-chat.store';
import { SupportHistoryApiService } from './support-history-api.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportHistoryStore {
  private readonly api = inject(SupportHistoryApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);
  private readonly busySignal = signal(false);

  readonly busy = this.busySignal.asReadonly();

  clear ({ keepStarred }: KeepStarredDto): void {
    const conversationId = this.chat.activeId();
    if (!conversationId) return;
    this.busySignal.set(true);
    this.api.clear({ conversationId, keepStarred }).subscribe({
      next: () => {
        this.busySignal.set(false);
        this.toast.success(SUPPORT_HISTORY.CLEARED);
        this.chat.select({ conversationId });
      },
      error: () => {
        this.busySignal.set(false);
        this.toast.error(SUPPORT_HISTORY.CLEAR_FAILED);
      }
    });
  }

  deleteMany ({ messages, scope }: BulkDeleteDto): void {
    const conversationId = this.chat.activeId();
    if (!conversationId || messages.length === 0) return;
    this.api.deleteMany({ conversationId, messageIds: messages.map(message => message.id), scope }).subscribe({
      next: ({ failed }) => {
        if (failed > 0) {
          this.toast.error(SUPPORT_HISTORY.PARTLY_DELETED);
          return this.chat.select({ conversationId });
        }
        for (const message of messages) {
          if (scope === SUPPORT_MESSAGE_RULES.SCOPE_ME) this.chat.removeMessage({ messageId: message.id });
          else this.chat.upsertMessage({ message: MessageRulesHelper.tombstone({ message }) });
        }
      },
      error: () => this.toast.error(SUPPORT_HISTORY.DELETE_FAILED)
    });
  }
}
