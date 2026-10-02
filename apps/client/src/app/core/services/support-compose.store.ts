import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { ComposeRequestDto } from '../interfaces/support/compose-request.interface';
import { SendRecordingDto } from '../interfaces/support/send-recording.interface';
import { FilesRefDto } from '../interfaces/support/files-ref.interface';
import { ComposeEditDto } from '../interfaces/support/compose-edit.interface';
import { ComposeSendDto } from '../interfaces/support/compose-send.interface';
import { MessageRefDto } from '../interfaces/support/message-ref.interface';
import { ConfirmDeleteDto } from '../interfaces/support/confirm-delete.interface';
import { MessageRulesHelper } from '../helpers/support/message-rules.helper';
import { SUPPORT_MESSAGE_RULES } from '../constants/support/support-message-rules.constant';
import { SUPPORT_ATTACHMENT } from '../constants/support/support-attachment.constant';
import { SUPPORT_MESSAGES } from '../constants/support/support-messages.constant';
import { SupportApiService } from './support-api.service';
import { SupportAttachmentHelper } from '../helpers/support/support-attachment.helper';
import { SupportChatHelper } from '../helpers/support/support-chat.helper';
import { SupportChatStore } from './support-chat.store';
import { SupportMessage } from '../types/support/support-message.type';
import { ToastService } from './toast.service';
import { SupportOfflineQueueStore } from './support-offline-queue.store';
import { OfflineQueueHelper } from '../helpers/support/offline-queue.helper';

@Injectable({ providedIn: 'root' })
export class SupportComposeStore {
  private readonly api = inject(SupportApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);
  private readonly offlineQueue = inject(SupportOfflineQueueStore);
  private readonly sendingSignal = signal(false);
  private readonly editingSignal = signal<SupportMessage | null>(null);
  private readonly replyingSignal = signal<SupportMessage | null>(null);
  private readonly deletingSignal = signal<SupportMessage | null>(null);

  readonly sending = this.sendingSignal.asReadonly();
  readonly editing = this.editingSignal.asReadonly();
  readonly replying = this.replyingSignal.asReadonly();
  readonly deleting = this.deletingSignal.asReadonly();

  send ({ conversationId, body, files }: ComposeSendDto): void {
    if (this.rejected({ files })) return;
    const replyToMessageId = files.length === 0 ? this.replyingSignal()?.id : undefined;
    const text = { conversationId, body, ...(replyToMessageId && { replyToMessageId }) };
    this.replyingSignal.set(null);
    if (files.length === 0 && !navigator.onLine) return this.offlineQueue.queue(text);

    const request: Observable<SupportMessage | SupportMessage[]> =
      files.length > 0 ? this.api.sendAttachments({ conversationId, body, files }) : this.api.sendMessage(text);
    const onNetworkFailure = files.length === 0 ? (): void => this.offlineQueue.queue(text) : undefined;

    this.run({ request, failure: SUPPORT_MESSAGES.SEND_FAILED, ...(onNetworkFailure && { onNetworkFailure }) });
  }

  sendRecording ({ conversationId, file, durationSeconds }: SendRecordingDto): void {
    if (this.rejected({ files: [file] })) return;
    this.run({ request: this.api.sendAttachments({ conversationId, body: '', files: [file], durationSeconds }), failure: SUPPORT_MESSAGES.SEND_FAILED });
  }

  startEdit ({ message }: MessageRefDto): void {
    this.replyingSignal.set(null);
    this.editingSignal.set(message);
  }

  startReply ({ message }: MessageRefDto): void {
    this.editingSignal.set(null);
    this.replyingSignal.set(message);
  }

  cancelReply (): void {
    this.replyingSignal.set(null);
  }

  cancelEdit (): void {
    this.editingSignal.set(null);
  }

  saveEdit ({ conversationId, body, file }: ComposeEditDto): void {
    const message = this.editingSignal();
    if (!message || this.rejected({ files: file ? [file] : [] })) return;

    this.editingSignal.set(null);
    this.run({ request: this.api.editMessage({ conversationId, messageId: message.id, body, file }), failure: SUPPORT_ATTACHMENT.EDIT_FAILED });
  }

  askDelete ({ message }: MessageRefDto): void {
    this.editingSignal.set(null);
    this.deletingSignal.set(message);
  }

  cancelDelete (): void {
    this.deletingSignal.set(null);
  }

  confirmDelete ({ conversationId, scope }: ConfirmDeleteDto): void {
    const message = this.deletingSignal();
    if (!message) return;

    this.deletingSignal.set(null);
    this.api.deleteMessage({ conversationId, messageId: message.id, scope }).subscribe({
      next: () => {
        if (scope === SUPPORT_MESSAGE_RULES.SCOPE_ME) this.chat.removeMessage({ messageId: message.id });
        else this.chat.upsertMessage({ message: MessageRulesHelper.tombstone({ message }) });
      },
      error: (error: unknown) => {
        if (!SupportChatHelper.isSilent({ error })) this.toast.error(SUPPORT_MESSAGE_RULES.DELETE_FAILED);
      }
    });
  }

  reset (): void {
    this.sendingSignal.set(false);
    this.editingSignal.set(null);
    this.replyingSignal.set(null);
    this.deletingSignal.set(null);
  }

  private rejected ({ files }: FilesRefDto): boolean {
    const problem = SupportAttachmentHelper.problemWith({ files });
    if (problem) this.toast.error(problem);
    return !!problem;
  }

  private run ({ request, failure, onNetworkFailure }: ComposeRequestDto): void {
    this.sendingSignal.set(true);

    request.subscribe({
      next: result => {
        this.sendingSignal.set(false);
        (Array.isArray(result) ? result : [result]).forEach(message => this.chat.upsertMessage({ message }));
      },
      error: (error: unknown) => {
        this.sendingSignal.set(false);
        if (onNetworkFailure && OfflineQueueHelper.isNetworkFailure({ error })) return onNetworkFailure();
        if (!SupportChatHelper.isSilent({ error })) this.toast.error(SupportChatHelper.failureMessage({ error, fallback: failure }));
      }
    });
  }
}
