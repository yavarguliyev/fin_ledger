import { Injector, runInInjectionContext, signal } from '@angular/core';
import { of } from 'rxjs';

import { SupportHistoryService } from '../../src/app/core/services/support-history.service';
import { SupportApiService } from '../../src/app/core/services/support-api.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportChatHelper } from '../../src/app/core/helpers/support/support-chat.helper';
import { SupportMessage } from '../../src/app/core/types/support/support-message.type';
import { SUPPORT_HISTORY_TEST as T } from '../constants/support-history.constant';

const page = (count: number, offset = 0): SupportMessage[] =>
  Array.from(
    { length: count },
    (_value, index) => ({ id: `m-${offset + index}`, createdAt: new Date(T.BASE_TIME + (offset + index) * T.STEP_MS).toISOString(), seen: false }) as SupportMessage
  );

const setup = (current: SupportMessage[], older: SupportMessage[]): { history: SupportHistoryService; listMessages: jest.Mock; prependOlder: jest.Mock } => {
  const messages = signal(current);
  const listMessages = jest.fn(() => of(older));
  const prependOlder = jest.fn(({ messages: added }: { messages: SupportMessage[] }) =>
    messages.set(SupportChatHelper.combine({ current: messages(), page: added }))
  );
  const chat = { activeId: signal(T.CONVERSATION), messages, prependOlder };
  const injector = Injector.create({
    providers: [
      { provide: SupportApiService, useValue: { listMessages } },
      { provide: SupportChatStore, useValue: chat }
    ]
  });

  return { history: runInInjectionContext(injector, () => new SupportHistoryService()), listMessages, prependOlder };
};

describe('SupportHistoryService', () => {
  it('asks for the page before the oldest loaded message and prepends it', () => {
    const latest = page(T.PAGE_SIZE, T.PAGE_SIZE);
    const { history, listMessages, prependOlder } = setup(latest, page(T.PAGE_SIZE));

    history.loadOlder();

    expect(listMessages).toHaveBeenCalledWith({ conversationId: T.CONVERSATION, before: latest[0]?.createdAt, limit: T.PAGE_SIZE });
    expect(prependOlder).toHaveBeenCalledTimes(1);
    expect(history.canLoadMore()).toBe(true);
  });

  it('stops once the start of the conversation is reached', () => {
    const { history, listMessages } = setup(page(T.PAGE_SIZE, T.SHORT_THREAD), page(T.SHORT_THREAD));

    history.loadOlder();
    history.loadOlder();

    expect(listMessages).toHaveBeenCalledTimes(1);
    expect(history.canLoadMore()).toBe(false);
  });

  it('never asks for history when the first page already holds the whole conversation', () => {
    const { history, listMessages } = setup(page(T.SHORT_THREAD), []);

    history.loadOlder();

    expect(listMessages).not.toHaveBeenCalled();
  });
});

describe('SupportChatHelper.combine', () => {
  it('merges pages in time order without duplicates and keeps the seen tick', () => {
    const current = page(3, 2).map((message, index) => (index === 0 ? { ...message, seen: true } : message));
    const combined = SupportChatHelper.combine({ current, page: page(3) });

    expect(combined.map(message => message.id)).toEqual(['m-0', 'm-1', 'm-2', 'm-3', 'm-4']);
    expect(combined.find(message => message.id === 'm-2')?.seen).toBe(true);
  });
});
