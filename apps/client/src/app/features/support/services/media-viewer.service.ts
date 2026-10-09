import { Injectable, computed, signal } from '@angular/core';

import { MediaOpenDto } from '../../../core/interfaces/support/media-open.interface';
import { MessageIdRefDto } from '../../../core/interfaces/support/message-id-ref.interface';
import { MEDIA_VIEWER } from '../constants/media-viewer.constant';
import { SupportMessage } from '../../../core/types/support/support-message.type';

@Injectable({ providedIn: 'root' })
export class MediaViewerService {
  private readonly itemsSignal = signal<SupportMessage[]>([]);
  private readonly indexSignal = signal(0);

  readonly items = this.itemsSignal.asReadonly();
  readonly index = this.indexSignal.asReadonly();
  readonly current = computed(() => this.itemsSignal()[this.indexSignal()] ?? null);
  readonly hasPrevious = computed(() => this.indexSignal() > 0);
  readonly hasNext = computed(() => this.indexSignal() < this.itemsSignal().length - MEDIA_VIEWER.STEP);

  open ({ items, messageId }: MediaOpenDto): void {
    const ordered = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const index = ordered.findIndex(item => item.id === messageId);
    if (index < 0) return;
    this.itemsSignal.set(ordered);
    this.indexSignal.set(index);
  }

  show ({ messageId }: MessageIdRefDto): void {
    this.open({ items: this.itemsSignal(), messageId });
  }

  previous (): void {
    if (this.hasPrevious()) this.indexSignal.update(index => index - MEDIA_VIEWER.STEP);
  }

  next (): void {
    if (this.hasNext()) this.indexSignal.update(index => index + MEDIA_VIEWER.STEP);
  }

  close (): void {
    this.itemsSignal.set([]);
    this.indexSignal.set(0);
  }
}
