import { Injectable, computed, inject, signal } from '@angular/core';

import { ConversationRefDto } from '../interfaces/support/conversation-ref.interface';
import { SUPPORT_PANEL } from '../constants/support/support-panel.constant';
import { StepUpRetryService } from './step-up-retry.service';
import { SupportChatStore } from './support-chat.store';
import { SupportPanelApiService } from './support-panel-api.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportLockStore {
  private readonly api = inject(SupportPanelApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly stepUp = inject(StepUpRetryService);
  private readonly toast = inject(ToastService);

  private readonly openSignal = signal<ReadonlySet<string>>(new Set());
  private readonly showLockedSignal = signal(false);

  readonly showLocked = this.showLockedSignal.asReadonly();
  readonly locked = computed(() => this.chat.conversations().filter(item => item.locked));
  readonly unlocked = computed(() => this.chat.conversations().filter(item => !item.locked));
  readonly activeLocked = computed(() => this.chat.activeConversation()?.locked ?? false);

  isBlocked ({ conversationId }: ConversationRefDto): boolean {
    const conversation = this.chat.conversations().find(item => item.id === conversationId);
    return !!conversation?.locked && !this.openSignal().has(conversationId);
  }

  toggleLockedList (): void {
    this.showLockedSignal.update(value => !value);
  }

  lock (): void {
    const conversationId = this.chat.activeId();
    if (!conversationId) return;

    this.api.lock({ conversationId }).subscribe({
      next: () => {
        this.toast.success(SUPPORT_PANEL.LOCKED);
        this.chat.loadConversations();
      },
      error: () => this.toast.error(SUPPORT_PANEL.LOCK_FAILED)
    });
  }

  removeLock (): void {
    const conversationId = this.chat.activeId();
    if (!conversationId) return;

    this.api.removeLock({ conversationId }).subscribe({
      next: () => {
        this.toast.success(SUPPORT_PANEL.UNLOCKED);
        this.chat.loadConversations();
      },
      error: () => this.toast.error(SUPPORT_PANEL.UNLOCK_FAILED)
    });
  }

  open ({ conversationId }: ConversationRefDto): void {
    this.stepUp.guard({ request: this.api.unlock({ conversationId }) }).subscribe({
      next: () => {
        this.openSignal.update(ids => new Set([...ids, conversationId]));
        this.chat.select({ conversationId });
      },
      error: () => this.toast.error(SUPPORT_PANEL.UNLOCK_FAILED)
    });
  }
}
