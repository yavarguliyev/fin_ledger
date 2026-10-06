import { Injectable, computed, inject, signal } from '@angular/core';

import { MessageIdRefDto } from '../interfaces/support/message-id-ref.interface';
import { StarredMessage } from '../interfaces/support/starred-message.interface';
import { SUPPORT_PANEL } from '../constants/support/support-panel.constant';
import { SupportChatStore } from './support-chat.store';
import { SupportPanelApiService } from './support-panel-api.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SupportStarStore {
  private readonly api = inject(SupportPanelApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly toast = inject(ToastService);

  private readonly starredSignal = signal<StarredMessage[]>([]);
  private readonly everywhereSignal = signal<StarredMessage[]>([]);
  private readonly everywhereOpenSignal = signal(false);

  readonly starred = this.starredSignal.asReadonly();
  readonly everywhere = this.everywhereSignal.asReadonly();
  readonly everywhereOpen = this.everywhereOpenSignal.asReadonly();
  readonly starredIds = computed<ReadonlySet<string>>(() => new Set(this.starredSignal().map(item => item.messageId)));

  load (): void {
    const conversationId = this.chat.activeId();
    this.starredSignal.set([]);
    if (!conversationId) return;
    this.api.starred({ conversationId }).subscribe({ next: rows => this.starredSignal.set(rows), error: () => undefined });
  }

  toggle ({ messageId }: MessageIdRefDto): void {
    const conversationId = this.chat.activeId();
    if (!conversationId) return;

    const starred = !this.starredIds().has(messageId);
    this.api.star({ conversationId, messageId, starred }).subscribe({
      next: rows => this.starredSignal.set(rows),
      error: () => this.toast.error(SUPPORT_PANEL.STAR_FAILED)
    });
  }

  openEverywhere (): void {
    this.everywhereOpenSignal.set(true);
    this.api.allStarred().subscribe({
      next: rows => this.everywhereSignal.set(rows),
      error: () => this.toast.error(SUPPORT_PANEL.LOAD_FAILED)
    });
  }

  closeEverywhere (): void {
    this.everywhereOpenSignal.set(false);
  }
}
