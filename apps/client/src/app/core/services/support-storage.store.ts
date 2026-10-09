import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, map, of } from 'rxjs';

import { MessageIdRefDto } from '../interfaces/support/message-id-ref.interface';
import { StorageSummary } from '../interfaces/support/storage-summary.interface';
import { SUPPORT_PANEL } from '../constants/support/support-panel.constant';
import { SupportChatStore } from './support-chat.store';
import { SupportPanelApiService } from './support-panel-api.service';
import { SupportHistoryApiService } from './support-history-api.service';
import { SUPPORT_MESSAGE_RULES } from '../constants/support/support-message-rules.constant';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportStorageStore {
  private readonly api = inject(SupportPanelApiService);
  private readonly history = inject(SupportHistoryApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);

  private readonly summarySignal = signal<StorageSummary | null>(null);
  private readonly selectedSignal = signal<ReadonlySet<string>>(new Set());
  private readonly deletingSignal = signal(false);

  readonly summary = this.summarySignal.asReadonly();
  readonly selected = this.selectedSignal.asReadonly();
  readonly deleting = this.deletingSignal.asReadonly();
  readonly selectedCount = computed(() => this.selectedSignal().size);

  load (): void {
    const conversationId = this.chat.activeId();
    this.selectedSignal.set(new Set());
    if (!conversationId) return this.summarySignal.set(null);
    this.api.storage({ conversationId }).subscribe({
      next: summary => this.summarySignal.set(summary),
      error: () => this.toast.error(SUPPORT_PANEL.LOAD_FAILED)
    });
  }

  toggle ({ messageId }: MessageIdRefDto): void {
    const next = new Set(this.selectedSignal());
    if (!next.delete(messageId)) next.add(messageId);
    this.selectedSignal.set(next);
  }

  deleteSelected (): void {
    const conversationId = this.chat.activeId();
    const messageIds = [...this.selectedSignal()];
    if (!conversationId || !messageIds.length || this.deletingSignal()) return;

    const mine = new Set((this.summarySignal()?.files ?? []).filter(file => file.mine).map(file => file.messageId));
    const own = messageIds.filter(id => mine.has(id));
    const theirs = messageIds.filter(id => !mine.has(id));

    this.deletingSignal.set(true);
    forkJoin([
      own.length ? this.api.deleteFiles({ conversationId, messageIds: own }).pipe(map(({ deleted }) => deleted)) : of(0),
      theirs.length ? this.history.deleteMany({ conversationId, messageIds: theirs, scope: SUPPORT_MESSAGE_RULES.SCOPE_ME }).pipe(map(({ deleted }) => deleted)) : of(0)
    ]).subscribe({
      next: ([ownDeleted, hidden]) => {
        const deleted = ownDeleted + hidden;
        theirs.forEach(messageId => this.chat.removeMessage({ messageId }));
        this.deletingSignal.set(false);
        this.toast.success(deleted === 1 ? SUPPORT_PANEL.DELETED_ONE : `${deleted} ${SUPPORT_PANEL.DELETED_MANY}`);
        this.load();
      },
      error: () => {
        this.deletingSignal.set(false);
        this.toast.error(SUPPORT_PANEL.DELETE_FAILED);
      }
    });
  }
}
