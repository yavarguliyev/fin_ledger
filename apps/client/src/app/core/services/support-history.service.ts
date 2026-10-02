import { Injectable, computed, inject, signal } from '@angular/core';

import { SUPPORT } from '../constants/support/support.constant';
import { SupportApiService } from './support-api.service';
import { SupportChatStore } from './support-chat.store';

@Injectable({ providedIn: 'root' })
export class SupportHistoryService {
  private readonly api = inject(SupportApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly pagedConversation = signal<string | null>(null);
  private readonly hasMoreSignal = signal(true);
  private readonly loadingSignal = signal(false);

  readonly loadingOlder = this.loadingSignal.asReadonly();
  readonly canLoadMore = computed(() =>
    this.chat.activeId() === this.pagedConversation() ? this.hasMoreSignal() : this.chat.messages().length >= SUPPORT.PAGE_SIZE
  );

  loadOlder (): void {
    const conversationId = this.chat.activeId();
    const oldest = this.chat.messages()[0];
    if (!conversationId || !oldest || !this.canLoadMore() || this.loadingSignal()) return;

    this.pagedConversation.set(conversationId);
    this.loadingSignal.set(true);

    this.api.listMessages({ conversationId, before: oldest.createdAt, limit: SUPPORT.PAGE_SIZE }).subscribe({
      next: messages => {
        this.loadingSignal.set(false);
        this.hasMoreSignal.set(messages.length >= SUPPORT.PAGE_SIZE);
        this.chat.prependOlder({ conversationId, messages });
      },
      error: () => this.loadingSignal.set(false)
    });
  }
}
