import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { ComposeRequestDto } from '../dtos/support/compose-request.dto';
import { SendRecordingDto } from '../dtos/support/send-recording.dto';
import { FilesRefDto } from '../dtos/support/files-ref.dto';
import { ComposeEditDto } from '../dtos/support/compose-edit.dto';
import { ComposeSendDto } from '../dtos/support/compose-send.dto';
import { MessageRefDto } from '../dtos/support/message-ref.dto';
import { ConfirmDeleteDto } from '../dtos/support/confirm-delete.dto';
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

@Injectable({ providedIn: 'root' })
export class SupportComposeStore {
  private readonly api = inject(SupportApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);
  private readonly sendingSignal = signal(false);
  private readonly editingSignal = signal<SupportMessage | null>(null);
  private readonly deletingSignal = signal<SupportMessage | null>(null);

  readonly sending = this.sendingSignal.asReadonly();
  readonly editing = this.editingSignal.asReadonly();
  readonly deleting = this.deletingSignal.asReadonly();

  send ({ conversationId, body, files }: ComposeSendDto): void {
    if (this.rejected({ files })) return;

    const request: Observable<SupportMessage | SupportMessage[]> =
      files.length > 0 ? this.api.sendAttachments({ conversationId, body, files }) : this.api.sendMessage({ conversationId, body });

    this.run({ request, failure: SUPPORT_MESSAGES.SEND_FAILED });
  }

  sendRecording ({ conversationId, file, durationSeconds }: SendRecordingDto): void {
    if (this.rejected({ files: [file] })) return;
    this.run({ request: this.api.sendAttachments({ conversationId, body: '', files: [file], durationSeconds }), failure: SUPPORT_MESSAGES.SEND_FAILED });
  }

  startEdit ({ message }: MessageRefDto): void {
    this.editingSignal.set(message);
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
    this.deletingSignal.set(null);
  }

  private rejected ({ files }: FilesRefDto): boolean {
    const problem = SupportAttachmentHelper.problemWith({ files });
    if (problem) this.toast.error(problem);
    return !!problem;
  }

  private run ({ request, failure }: ComposeRequestDto): void {
    this.sendingSignal.set(true);

    request.subscribe({
      next: result => {
        this.sendingSignal.set(false);
        (Array.isArray(result) ? result : [result]).forEach(message => this.chat.upsertMessage({ message }));
      },
      error: (error: unknown) => {
        this.sendingSignal.set(false);
        if (!SupportChatHelper.isSilent({ error })) this.toast.error(failure);
      }
    });
  }
}
