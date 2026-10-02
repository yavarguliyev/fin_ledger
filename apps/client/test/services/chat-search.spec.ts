import { DestroyRef, Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ChatSearchService } from '../../src/app/features/support/services/chat-search.service';
import { MessageHit } from '../../src/app/core/interfaces/support/message-hit.interface';
import { SearchMessagesDto } from '../../src/app/core/interfaces/support/search-messages.interface';
import { SupportApiService } from '../../src/app/core/services/support-api.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { MessageRevealService } from '../../src/app/features/support/services/message-reveal.service';
import { CHAT_SEARCH_TEST as T } from '../constants/chat-search.constant';

const hit: MessageHit = { id: T.MESSAGE_ID, senderUserId: null, body: T.BODY, createdAt: T.CREATED_AT };
const searchMessages = jest.fn<Observable<MessageHit[]>, [SearchMessagesDto]>(() => of([hit]));
const reveal = jest.fn();

const create = (): ChatSearchService => {
  const injector = Injector.create({
    providers: [
      { provide: SupportApiService, useValue: { searchMessages } },
      { provide: SupportChatStore, useValue: { activeId: (): string => T.CONVERSATION } },
      { provide: MessageRevealService, useValue: { reveal } },
      { provide: DestroyRef, useValue: { onDestroy: (): (() => void) => () => undefined } }
    ]
  });
  return runInInjectionContext(injector, () => new ChatSearchService());
};

describe('ChatSearchService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    searchMessages.mockClear();
    reveal.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  it('asks the server once the user pauses typing, and not for a single letter', () => {
    const service = create();
    service.search(T.SHORT);
    service.search(T.TERM);
    jest.advanceTimersByTime(T.DEBOUNCE_MS);

    expect(searchMessages).toHaveBeenCalledTimes(1);
    expect(searchMessages).toHaveBeenCalledWith({ conversationId: T.CONVERSATION, q: T.TERM });
    expect(service.results()).toEqual([hit]);
  });

  it('closes the panel and hands the jump to the reveal service', () => {
    const service = create();
    service.toggle();
    service.reveal({ messageId: T.MESSAGE_ID });

    expect(service.open()).toBe(false);
    expect(reveal).toHaveBeenCalledWith({ messageId: T.MESSAGE_ID });
  });
});
