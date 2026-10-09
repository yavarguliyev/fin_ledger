import { Injectable, signal } from '@angular/core';

import { CHAT_FILTER } from '../../../core/constants/support/chat-filter.constant';
import { ChatFilter } from '../../../core/types/support/chat-filter.type';

@Injectable({ providedIn: 'root' })
export class ChatFilterService {
  private readonly filterSignal = signal<ChatFilter>(CHAT_FILTER.ALL);

  readonly filter = this.filterSignal.asReadonly();

  set (filter: ChatFilter): void {
    this.filterSignal.set(filter);
  }
}
