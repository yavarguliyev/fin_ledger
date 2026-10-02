import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';

import { NewMessagesHelper } from '../helpers/new-messages.helper';
import { SupportChatStore } from '../../../core/services/support-chat.store';
import { TrackMessagesDto } from '../interfaces/track-messages.interface';

@Injectable()
export class NewMessagesService {
  private readonly chat = inject(SupportChatStore);
  private readonly markerSignal = signal<string | null>(null);
  private readonly atBottomSignal = signal(true);
  private readonly seenTailSignal = signal<string | null>(null);
  private readonly ownTailSignal = signal<string | null>(null);
  private openedUnread = 0;
  private tailId: string | null = null;

  readonly markerId = this.markerSignal.asReadonly();
  readonly ownTail = this.ownTailSignal.asReadonly();
  readonly showJump = computed(() => !this.atBottomSignal() && this.chat.messages().length > 0);
  readonly unseen = computed(() =>
    NewMessagesHelper.countIncomingAfter({ messages: this.chat.messages(), afterId: this.seenTailSignal(), myUserId: this.chat.myUserId() })
  );

  constructor () {
    effect(() => {
      this.chat.activeId();
      untracked(() => this.reset());
    });

    effect(() => {
      const messages = this.chat.messages();
      untracked(() => this.track({ messages }));
    });
  }

  setAtBottom (atBottom: boolean): void {
    this.atBottomSignal.set(atBottom);
    if (atBottom) this.seenTailSignal.set(this.tailId);
  }

  private reset (): void {
    this.markerSignal.set(null);
    this.seenTailSignal.set(null);
    this.ownTailSignal.set(null);
    this.atBottomSignal.set(true);
    this.openedUnread = this.chat.activeConversation()?.unreadCount ?? 0;
    this.tailId = null;
  }

  private track ({ messages }: TrackMessagesDto): void {
    const tail = messages.at(-1)?.id ?? null;
    if (!tail || tail === this.tailId) return;

    const own = NewMessagesHelper.ownNewTail({ messages, previousTail: this.tailId, myUserId: this.chat.myUserId() });
    if (own) this.ownTailSignal.set(own);

    if (!this.tailId) this.markerSignal.set(NewMessagesHelper.markerAfterOpen({ messages, unread: this.openedUnread }));
    else if (!this.atBottomSignal() && !this.markerSignal()) {
      this.markerSignal.set(NewMessagesHelper.firstIncomingAfter({ messages, afterId: this.tailId, myUserId: this.chat.myUserId() }));
    }

    if (this.atBottomSignal()) this.seenTailSignal.set(tail);
    this.tailId = tail;
  }
}
