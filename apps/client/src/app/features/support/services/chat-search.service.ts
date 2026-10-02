import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';

import { CHAT_SEARCH } from '../constants/chat-search.constant';
import { MessageHit } from '../../../core/interfaces/support/message-hit.interface';
import { MessageIdRefDto } from '../../../core/interfaces/support/message-id-ref.interface';
import { MessageRevealService } from './message-reveal.service';
import { SupportApiService } from '../../../core/services/support-api.service';
import { SupportChatStore } from '../../../core/services/support-chat.store';

@Injectable()
export class ChatSearchService {
  private readonly api = inject(SupportApiService);
  private readonly chat = inject(SupportChatStore);
  private readonly revealer = inject(MessageRevealService);
  private readonly terms = new Subject<string>();
  private readonly openSignal = signal(false);
  private readonly resultsSignal = signal<MessageHit[] | null>(null);

  readonly open = this.openSignal.asReadonly();
  readonly results = this.resultsSignal.asReadonly();

  constructor () {
    this.terms
      .pipe(
        debounceTime(CHAT_SEARCH.DEBOUNCE_MS),
        switchMap(term => {
          const conversationId = this.chat.activeId();
          if (!conversationId || term.length < CHAT_SEARCH.MIN_LENGTH) return of(null);
          return this.api.searchMessages({ conversationId, q: term }).pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(results => this.resultsSignal.set(results));
  }

  toggle (): void {
    this.openSignal.set(!this.openSignal());
    this.resultsSignal.set(null);
  }

  search (term: string): void {
    this.terms.next(term.trim());
  }

  reveal ({ messageId }: MessageIdRefDto): void {
    this.openSignal.set(false);
    this.revealer.reveal({ messageId });
  }
}
