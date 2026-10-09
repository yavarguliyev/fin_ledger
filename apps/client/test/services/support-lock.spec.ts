import { Injector, runInInjectionContext, signal } from '@angular/core';

import { StepUpRetryService } from '../../src/app/core/services/step-up-retry.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportLockStore } from '../../src/app/core/services/support-lock.store';
import { SupportPanelApiService } from '../../src/app/core/services/support-panel-api.service';
import { ToastService } from '../../src/app/core/services/toast.service';
import { SupportConversation } from '../../src/app/core/types/support/support-conversation.type';
import { CHAT_LOCK_TEST as T } from '../constants/chat-lock.constant';
import { aSupportConversation } from '../fakes/support.fake';

const conversations = signal<SupportConversation[]>([]);

const create = (): SupportLockStore => {
  const injector = Injector.create({
    providers: [
      { provide: SupportChatStore, useValue: { conversations, activeConversation: (): null => null } },
      { provide: SupportPanelApiService, useValue: {} },
      { provide: StepUpRetryService, useValue: {} },
      { provide: ToastService, useValue: {} }
    ]
  });
  return runInInjectionContext(injector, () => new SupportLockStore());
};

describe('SupportLockStore', () => {
  it('falls back to the open chats once the last locked chat is unlocked', () => {
    const open = aSupportConversation({ id: T.OPEN_ID });
    conversations.set([open, aSupportConversation({ id: T.LOCKED_ID, locked: true })]);
    const store = create();
    store.toggleLockedList();

    conversations.set([open, aSupportConversation({ id: T.LOCKED_ID, locked: false })]);

    expect(store.showLocked()).toBe(false);
    expect(store.visible().map(item => item.id)).toEqual([T.OPEN_ID, T.LOCKED_ID]);
  });
});
