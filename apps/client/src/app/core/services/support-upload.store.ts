import { HttpEventType } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';

import { SendAttachmentsDto } from '../interfaces/support/send-attachments.interface';
import { SUPPORT_MESSAGES } from '../constants/support/support-messages.constant';
import { SupportApiService } from './support-api.service';
import { SupportChatHelper } from '../helpers/support/support-chat.helper';
import { SupportChatStore } from './support-chat.store';
import { ToastService } from './toast.service';
import { UploadProgressHelper } from '../helpers/http/upload-progress.helper';
import { UploadPreviewHelper } from '../helpers/support/upload-preview.helper';
import { PendingUpload } from '../interfaces/support/pending-upload.interface';
import { PENDING_UPLOAD } from '../constants/support/pending-upload.constant';

@Injectable({ providedIn: 'root' })
export class SupportUploadStore {
  private readonly api = inject(SupportApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);
  private readonly progressSignal = signal<number | null>(null);
  private readonly pendingSignal = signal<PendingUpload | null>(null);
  private active: Subscription | null = null;

  readonly progress = this.progressSignal.asReadonly();
  readonly uploading = computed(() => this.progressSignal() !== null);
  readonly pendingHere = computed(() => {
    const pending = this.pendingSignal();
    return pending && pending.conversationId === this.chat.activeId() ? pending : null;
  });

  start (dto: SendAttachmentsDto): void {
    this.cancel();
    this.progressSignal.set(0);
    this.pendingSignal.set({
      localId: `${PENDING_UPLOAD.LOCAL_PREFIX}${crypto.randomUUID()}`,
      conversationId: dto.conversationId,
      body: dto.body,
      files: UploadPreviewHelper.fromFiles({ files: dto.files })
    });
    this.active = this.api.sendAttachments(dto).subscribe({
      next: event => {
        const percent = UploadProgressHelper.percentOf({ event });
        if (percent !== null) this.progressSignal.set(percent);
        if (event.type !== HttpEventType.Response) return;
        (event.body ?? []).forEach(message => this.chat.upsertMessage({ message }));
        this.finish();
      },
      error: (error: unknown) => {
        this.finish();
        if (!SupportChatHelper.isSilent({ error })) this.toast.error(SupportChatHelper.failureMessage({ error, fallback: SUPPORT_MESSAGES.SEND_FAILED }));
      }
    });
  }

  cancel (): void {
    this.active?.unsubscribe();
    this.finish();
  }

  private finish (): void {
    const pending = this.pendingSignal();
    if (pending) UploadPreviewHelper.release({ upload: pending });

    this.active = null;
    this.progressSignal.set(null);
    this.pendingSignal.set(null);
  }
}
