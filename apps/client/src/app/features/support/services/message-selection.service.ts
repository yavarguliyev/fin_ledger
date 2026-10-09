import { Injectable, computed, inject, signal } from '@angular/core';

import { AlbumHelper } from '../../../core/helpers/support/album.helper';
import { MESSAGE_SELECTION } from '../constants/message-selection.constant';
import { MessageIdsRefDto } from '../../../core/interfaces/support/message-ids-ref.interface';
import { SupportChatStore } from '../../../core/services/support-chat.store';
import { SupportMessage } from '../../../core/types/support/support-message.type';

@Injectable({ providedIn: 'root' })
export class MessageSelectionService {
  private readonly chat = inject(SupportChatStore);
  private readonly idsSignal = signal<ReadonlySet<string>>(new Set());
  private readonly startedInSignal = signal<string | null>(null);
  private readonly askingSignal = signal(false);
  private readonly quickSignal = signal(false);
  private readonly albums = computed(() => AlbumHelper.layout({ messages: this.chat.messages() }));

  readonly labels = MESSAGE_SELECTION;
  readonly active = computed(() => this.startedInSignal() !== null && this.startedInSignal() === this.chat.activeId());
  readonly asking = computed(() => this.active() && this.askingSignal());
  readonly selected = computed(() => (this.active() ? this.chat.messages().filter(message => this.idsSignal().has(message.id)) : []));
  readonly count = computed(() => this.selected().length);

  selectable (message: SupportMessage): boolean {
    return !message.deletedAt && message.kind !== MESSAGE_SELECTION.SYSTEM_KIND;
  }

  isAlbum (message: SupportMessage): boolean {
    return this.albums().firsts.has(message.id);
  }

  idsOf (message: SupportMessage): string[] {
    return this.albums().firsts.get(message.id)?.map(item => item.id) ?? [message.id];
  }

  has (messageId: string): boolean {
    return this.active() && this.idsSignal().has(messageId);
  }

  start ({ messageIds }: MessageIdsRefDto): void {
    this.startedInSignal.set(this.chat.activeId());
    this.askingSignal.set(false);
    this.quickSignal.set(false);
    this.idsSignal.set(new Set(messageIds));
  }

  remove ({ messageIds }: MessageIdsRefDto): void {
    this.start({ messageIds });
    this.quickSignal.set(true);
    this.ask();
  }

  toggle ({ messageIds }: MessageIdsRefDto): void {
    const next = new Set(this.idsSignal());
    const selected = messageIds.every(id => next.has(id));
    messageIds.forEach(id => (selected ? next.delete(id) : next.add(id)));
    this.idsSignal.set(next);
  }

  ask (): void {
    if (this.count() > 0) this.askingSignal.set(true);
  }

  dismiss (): void {
    if (this.quickSignal()) return this.exit();
    this.askingSignal.set(false);
  }

  exit (): void {
    this.startedInSignal.set(null);
    this.askingSignal.set(false);
    this.idsSignal.set(new Set());
  }
}
