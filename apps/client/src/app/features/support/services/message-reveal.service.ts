import { Injectable, inject } from '@angular/core';

import { CHAT_SEARCH } from '../constants/chat-search.constant';
import { FlashElementDto } from '../interfaces/flash-element.interface';
import { MessageIdRefDto } from '../../../core/interfaces/support/message-id-ref.interface';
import { RevealAttemptDto } from '../interfaces/reveal-attempt.interface';
import { SUPPORT_VIEW } from '../constants/support-view.constant';
import { SupportHistoryService } from '../../../core/services/support-history.service';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class MessageRevealService {
  private readonly history = inject(SupportHistoryService);
  private readonly toast = inject(ToastService);

  reveal ({ messageId }: MessageIdRefDto): void {
    this.tryReveal({ messageId, attempt: 0 });
  }

  private tryReveal ({ messageId, attempt }: RevealAttemptDto): void {
    const element = document.getElementById(`${SUPPORT_VIEW.MESSAGE_ID_PREFIX}${messageId}`);
    if (element) return this.flash({ element });

    const exhausted = attempt >= CHAT_SEARCH.MAX_ATTEMPTS || (!this.history.canLoadMore() && !this.history.loadingOlder());
    if (exhausted) return this.toast.info(CHAT_SEARCH.NOT_LOADED);

    if (!this.history.loadingOlder()) this.history.loadOlder();
    setTimeout(() => this.tryReveal({ messageId, attempt: attempt + 1 }), CHAT_SEARCH.RETRY_MS);
  }

  private flash ({ element }: FlashElementDto): void {
    element.scrollIntoView({ block: CHAT_SEARCH.SCROLL_BLOCK, behavior: CHAT_SEARCH.SCROLL_BEHAVIOR });
    element.classList.add(...CHAT_SEARCH.FLASH_CLASSES);
    setTimeout(() => element.classList.remove(...CHAT_SEARCH.FLASH_CLASSES), CHAT_SEARCH.FLASH_MS);
  }
}
