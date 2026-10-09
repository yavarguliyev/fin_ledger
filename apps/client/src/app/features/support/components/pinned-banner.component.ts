import { Component, ChangeDetectionStrategy, computed, effect, inject, signal } from '@angular/core';

import { MessageRevealService } from '../services/message-reveal.service';
import { SUPPORT_ATTACHMENT } from '../../../core/constants/support/support-attachment.constant';
import { SUPPORT_PINS } from '../../../core/constants/support/support-pins.constant';
import { SupportChatStore } from '../../../core/services/support-chat.store';
import { SupportMessage } from '../../../core/types/support/support-message.type';
import { SupportPinsStore } from '../../../core/services/support-pins.store';

@Component({
  selector: 'app-pinned-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/pinned-banner.component.html'
})
export class PinnedBannerComponent {
  private readonly chat = inject(SupportChatStore);
  private readonly reveal = inject(MessageRevealService);
  private readonly step = signal(0);

  readonly pins = inject(SupportPinsStore);
  readonly labels = SUPPORT_PINS;
  readonly index = computed(() => this.step() % Math.max(this.pins.pins().length, 1));
  readonly current = computed(() => this.pins.pins()[this.index()] ?? null);

  constructor () {
    effect(() => {
      const conversationId = this.chat.activeId();
      this.step.set(0);
      if (conversationId) this.pins.load({ conversationId });
    });
  }

  open (message: SupportMessage): void {
    this.reveal.reveal({ messageId: message.id });
    this.step.update(value => value + 1);
  }

  text (message: SupportMessage): string {
    if (message.body) return message.body;
    if (message.kind === SUPPORT_ATTACHMENT.IMAGE_KIND) return SUPPORT_PINS.PHOTO;
    if (message.kind === SUPPORT_ATTACHMENT.VIDEO_KIND) return SUPPORT_PINS.VIDEO;
    return message.attachment?.fileName ?? SUPPORT_PINS.ATTACHMENT;
  }
}
