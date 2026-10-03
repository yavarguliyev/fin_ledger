import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ReactMessageDto } from '../../src/app/core/interfaces/support/react-message.interface';
import { Reaction } from '../../src/app/core/interfaces/support/reaction.interface';
import { SupportApiService } from '../../src/app/core/services/support-api.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportMessage } from '../../src/app/core/types/support/support-message.type';
import { SupportReactionStore } from '../../src/app/core/services/support-reaction.store';
import { ToastService } from '../../src/app/core/services/toast.service';
import { REACTION_TEST as T } from '../constants/reaction.constant';
import { aSupportMessage } from '../fakes/support.fake';

const mine: Reaction = { emoji: T.THUMBS, userId: T.ME };
const react = jest.fn<Observable<Reaction[]>, [ReactMessageDto]>(() => of([]));
const upsertMessage = jest.fn();

const create = (activeId: string): SupportReactionStore => {
  const message = aSupportMessage({ id: T.MESSAGE, reactions: [mine] });
  const injector = Injector.create({
    providers: [
      { provide: SupportApiService, useValue: { react } },
      { provide: SupportChatStore, useValue: { activeId: (): string => activeId, messages: (): SupportMessage[] => [message], myUserId: (): string => T.ME, upsertMessage } },
      { provide: ToastService, useValue: { error: jest.fn() } }
    ]
  });
  return runInInjectionContext(injector, () => new SupportReactionStore());
};

describe('SupportReactionStore', () => {
  beforeEach(() => [react, upsertMessage].forEach(mock => mock.mockClear()));

  it('clears my reaction when I tap the emoji I already picked', () => {
    create(T.CONVERSATION).toggle({ messageId: T.MESSAGE, emoji: T.THUMBS });

    expect(react).toHaveBeenCalledWith({ conversationId: T.CONVERSATION, messageId: T.MESSAGE, emoji: null });
  });

  it('applies reactions pushed by the stream to the open conversation only', () => {
    const peer = [{ emoji: T.HEART, userId: T.PEER }];
    const store = create(T.CONVERSATION);
    store.applyEvent({ event: { type: T.EVENT, conversationId: T.OTHER_CONVERSATION, messageId: T.MESSAGE, reactions: peer } });
    store.applyEvent({ event: { type: T.EVENT, conversationId: T.CONVERSATION, messageId: T.MESSAGE, reactions: peer } });

    expect(upsertMessage).toHaveBeenCalledTimes(1);
    expect(upsertMessage).toHaveBeenCalledWith({ message: expect.objectContaining({ reactions: peer }) as unknown });
  });
});
