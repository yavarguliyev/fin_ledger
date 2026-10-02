import { Injectable, computed, inject, signal } from '@angular/core';

import { SessionStore } from './session-store.service';
import { ConversationRefDto } from '../interfaces/support/conversation-ref.interface';
import { RoleHelper } from '../helpers/auth/role.helper';
import { SUPPORT_MESSAGES } from '../constants/support/support-messages.constant';
import { SUPPORT_ATTACHMENT } from '../constants/support/support-attachment.constant';
import { SupportApiService } from './support-api.service';
import { SupportChatHelper } from '../helpers/support/support-chat.helper';
import { SupportConversation } from '../types/support/support-conversation.type';
import { SupportMessage } from '../types/support/support-message.type';
import { MessageRefDto } from '../interfaces/support/message-ref.interface';
import { MessageIdRefDto } from '../interfaces/support/message-id-ref.interface';
import { ReportFailureDto } from '../interfaces/support/report-failure.interface';
import { SupportStreamEvent } from '../interfaces/support/support-stream-event.interface';
import { ToastService } from './toast.service';
import { StaffRefDto } from '../interfaces/support/staff-ref.interface';
import { PrependMessagesDto } from '../interfaces/support/prepend-messages.interface';

@Injectable({ providedIn: 'root' })
export class SupportChatStore {
  private readonly api = inject(SupportApiService);
  private readonly session = inject(SessionStore);
  private readonly toast = inject(ToastService);

  private readonly conversationsSignal = signal<SupportConversation[]>([]);
  private readonly messagesSignal = signal<SupportMessage[]>([]);
  private readonly activeIdSignal = signal<string | null>(null);
  private readonly loadingSignal = signal(false);

  readonly conversations = this.conversationsSignal.asReadonly();
  readonly messages = this.messagesSignal.asReadonly();
  readonly activeId = this.activeIdSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isStaff = computed(() => RoleHelper.isStaff({ role: this.session.user()?.role }));
  readonly myUserId = computed(() => this.session.user()?.id ?? '');
  readonly totalUnread = computed(() => this.conversationsSignal().reduce((sum, item) => sum + item.unreadCount, 0));
  readonly activeConversation = computed(() => this.conversationsSignal().find(item => item.id === this.activeIdSignal()) ?? null);

  markRead ({ conversationId }: ConversationRefDto): void {
    this.api.markRead({ conversationId }).subscribe({
      next: () => this.conversationsSignal.set(SupportChatHelper.clearUnread({ current: this.conversationsSignal(), conversationId })),
      error: () => undefined
    });
  }

  openWith ({ staffUserId }: StaffRefDto): void {
    const existing = this.conversationsSignal().find(item => item.assignedStaffId === staffUserId);
    if (existing) return this.select({ conversationId: existing.id });

    this.api.openConversation({ staffUserId }).subscribe({
      next: conversation => {
        this.conversationsSignal.set(SupportChatHelper.upsertConversation({ current: this.conversationsSignal(), incoming: conversation }));
        this.select({ conversationId: conversation.id });
      },
      error: (err: unknown) => this.report({ error: err, message: SUPPORT_MESSAGES.LOAD_FAILED })
    });
  }

  reset (): void {
    this.conversationsSignal.set([]);
    this.close();
    this.loadingSignal.set(false);
  }

  loadConversations (): void {
    this.api.listConversations().subscribe({
      next: conversations => this.conversationsSignal.set(conversations),
      error: (err: unknown) => this.report({ error: err, message: SUPPORT_MESSAGES.LOAD_FAILED })
    });
  }

  resync (): void {
    const conversationId = this.activeIdSignal();
    if (!conversationId) return;

    this.api.listMessages({ conversationId }).subscribe({
      next: messages => this.messagesSignal.set(SupportChatHelper.combine({ current: this.messagesSignal(), page: messages })),
      error: () => undefined
    });
  }

  applyStreamEvent (event: SupportStreamEvent): void {
    if (!event.conversationId) return;

    if (!event.message) {
      const reader = event.readerUserId;
      if (reader && reader !== this.myUserId() && event.conversationId === this.activeIdSignal()) {
        this.messagesSignal.set(SupportChatHelper.markSeen({ current: this.messagesSignal(), readerUserId: reader }));
      }
      return;
    }

    this.upsertMessage({ message: event.message });
    if (event.type === SUPPORT_ATTACHMENT.MESSAGE_UPDATED_EVENT) return;

    if (event.conversationId !== this.activeIdSignal()) this.loadConversations();
    else this.markRead({ conversationId: event.conversationId });
  }

  close (): void {
    this.activeIdSignal.set(null);
    this.messagesSignal.set([]);
  }

  select ({ conversationId }: ConversationRefDto): void {
    if (!conversationId) return;

    this.activeIdSignal.set(conversationId);
    this.loadingSignal.set(true);
    this.messagesSignal.set([]);

    this.api.listMessages({ conversationId }).subscribe({
      next: messages => {
        this.loadingSignal.set(false);
        this.messagesSignal.set(messages);
        this.markRead({ conversationId });
      },
      error: (err: unknown) => {
        this.loadingSignal.set(false);
        this.report({ error: err, message: SUPPORT_MESSAGES.LOAD_FAILED });
      }
    });
  }

  prependOlder ({ conversationId, messages }: PrependMessagesDto): void {
    if (conversationId !== this.activeIdSignal()) return;
    this.messagesSignal.set(SupportChatHelper.combine({ current: this.messagesSignal(), page: messages }));
  }

  upsertMessage ({ message }: MessageRefDto): void {
    if (message.conversationId !== this.activeIdSignal()) return;
    this.messagesSignal.set(SupportChatHelper.upsertMessage({ current: this.messagesSignal(), incoming: message }));
  }

  private report ({ error, message }: ReportFailureDto): void {
    if (SupportChatHelper.isSilent({ error })) return;
    this.toast.error(message);
  }

  removeMessage ({ messageId }: MessageIdRefDto): void {
    this.messagesSignal.set(this.messagesSignal().filter(message => message.id !== messageId));
  }
}
