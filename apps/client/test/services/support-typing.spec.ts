import { Injector, runInInjectionContext } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SupportTypingStore } from '../../src/app/core/services/support-typing.store';
import { SupportApiService } from '../../src/app/core/services/support-api.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportStreamEvent } from '../../src/app/core/interfaces/support/support-stream-event.interface';
import { SUPPORT_TYPING_TEST as T } from '../constants/support-typing.constant';
import { aSupportMessage } from '../fakes/support.fake';

const typingCall = jest.fn<Observable<unknown>, [{ conversationId: string }]>(() => of({}));

const create = (): SupportTypingStore => {
  const injector = Injector.create({
    providers: [
      { provide: SupportApiService, useValue: { typing: typingCall } },
      { provide: SupportChatStore, useValue: { myUserId: (): string => T.ME } }
    ]
  });
  return runInInjectionContext(injector, () => new SupportTypingStore());
};

const typingFrom = (typingUserId: string): SupportStreamEvent => ({ type: T.TYPING_EVENT, conversationId: T.CONVERSATION, typingUserId });

const messageFrom = (senderUserId: string): SupportStreamEvent => ({
  type: T.MESSAGE_EVENT,
  conversationId: T.CONVERSATION,
  message: aSupportMessage({ senderUserId })
});

describe('SupportTypingStore showing the peer typing', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the peer typing and hides it again once they go quiet', () => {
    const store = create();
    store.applyEvent({ event: typingFrom(T.PEER) });

    expect(store.typingIn().has(T.CONVERSATION)).toBe(true);

    jest.advanceTimersByTime(T.SHOW_MS);
    expect(store.typingIn().has(T.CONVERSATION)).toBe(false);
  });

  it('hides the indicator as soon as the peer message arrives', () => {
    const store = create();
    store.applyEvent({ event: typingFrom(T.PEER) });
    store.applyEvent({ event: messageFrom(T.PEER) });

    expect(store.typingIn().has(T.CONVERSATION)).toBe(false);
  });

  it('never shows my own typing back to me', () => {
    const store = create();
    store.applyEvent({ event: typingFrom(T.ME) });

    expect(store.typingIn().size).toBe(0);
  });
});

describe('SupportTypingStore telling the peer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    typingCall.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  it('sends at most one typing signal every few seconds', () => {
    const store = create();
    store.notify({ conversationId: T.CONVERSATION });
    jest.advanceTimersByTime(T.SEND_EVERY_MS - T.JUST_UNDER_MS);
    store.notify({ conversationId: T.CONVERSATION });

    expect(typingCall).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(T.JUST_UNDER_MS);
    store.notify({ conversationId: T.CONVERSATION });
    expect(typingCall).toHaveBeenCalledTimes(2);
  });
});
