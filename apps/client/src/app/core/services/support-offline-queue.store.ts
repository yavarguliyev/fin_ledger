import { Injectable, inject, signal } from '@angular/core';

import { OFFLINE_QUEUE } from '../constants/support/offline-queue.constant';
import { OfflineQueueHelper } from '../helpers/support/offline-queue.helper';
import { PendingMessage } from '../interfaces/support/pending-message.interface';
import { QueueMessageDto } from '../interfaces/support/queue-message.interface';
import { LocalIdRefDto } from '../interfaces/support/local-id-ref.interface';
import { SupportApiService } from './support-api.service';
import { SupportChatStore } from './support-chat.store';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportOfflineQueueStore {
  private readonly api = inject(SupportApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);
  private readonly pendingSignal = signal<PendingMessage[]>([]);
  private flushing = false;
  private counter = 0;

  readonly pending = this.pendingSignal.asReadonly();

  listen (): void {
    window.addEventListener(OFFLINE_QUEUE.ONLINE_EVENT, () => this.flush());
  }

  queue ({ conversationId, body, replyToMessageId }: QueueMessageDto): void {
    this.counter += 1;
    const localId = `${OFFLINE_QUEUE.LOCAL_PREFIX}${this.counter}`;
    this.pendingSignal.set([...this.pendingSignal(), { localId, conversationId, body, ...(replyToMessageId && { replyToMessageId }) }]);
  }

  flush (): void {
    const [next] = this.pendingSignal();
    if (!next || this.flushing) return;

    this.flushing = true;
    const { conversationId, body, replyToMessageId } = next;
    this.api.sendMessage({ conversationId, body, ...(replyToMessageId && { replyToMessageId }) }).subscribe({
      next: message => {
        this.settle({ localId: next.localId });
        this.chat.upsertMessage({ message });
        this.flush();
      },
      error: (error: unknown) => {
        this.flushing = false;
        if (OfflineQueueHelper.isNetworkFailure({ error })) return;
        this.settle({ localId: next.localId });
        this.toast.error(OFFLINE_QUEUE.DROPPED_MESSAGE);
        this.flush();
      }
    });
  }

  private settle ({ localId }: LocalIdRefDto): void {
    this.flushing = false;
    this.pendingSignal.set(this.pendingSignal().filter(item => item.localId !== localId));
  }
}
