import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PinMessageDto } from '../../src/app/core/interfaces/support/pin-message.interface';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportMessage } from '../../src/app/core/types/support/support-message.type';
import { SupportPinsApiService } from '../../src/app/core/services/support-pins-api.service';
import { SupportPinsStore } from '../../src/app/core/services/support-pins.store';
import { ToastService } from '../../src/app/core/services/toast.service';
import { SUPPORT_PINS_TEST as T } from '../constants/support-pins.constant';
import { aSupportMessage } from '../fakes/support.fake';

const activeId = signal<string>(T.CONVERSATION);
const pinned = [aSupportMessage({ id: T.MESSAGE })];
const list = jest.fn<Observable<SupportMessage[]>, [unknown]>(() => of(pinned));
const pin = jest.fn<Observable<SupportMessage[]>, [PinMessageDto]>(() => of(pinned));

const create = (): SupportPinsStore => {
  const injector = Injector.create({
    providers: [
      { provide: SupportPinsApiService, useValue: { list, pin } },
      { provide: SupportChatStore, useValue: { activeId } },
      { provide: ToastService, useValue: { error: jest.fn() } }
    ]
  });
  return runInInjectionContext(injector, () => new SupportPinsStore());
};

describe('SupportPinsStore', () => {
  beforeEach(() => {
    activeId.set(T.CONVERSATION);
    [list, pin].forEach(mock => mock.mockClear());
  });

  it('pins the message picked for the chosen duration and shows it as pinned', () => {
    const store = create();
    store.choose({ messageId: T.MESSAGE });
    store.pin({ duration: T.DAY });

    expect(pin).toHaveBeenCalledWith({ conversationId: T.CONVERSATION, messageId: T.MESSAGE, duration: T.DAY });
    expect(store.choosing()).toBeNull();
    expect(store.pinnedIds().has(T.MESSAGE)).toBe(true);
  });

  it('hides pins that belong to another chat', () => {
    const store = create();
    store.load({ conversationId: T.CONVERSATION });
    activeId.set(T.OTHER_CONVERSATION);

    expect(store.pins()).toEqual([]);
  });

  it('reloads only when the open chat reports its pins changed', () => {
    const store = create();
    store.applyEvent({ event: { type: T.CREATED, conversationId: T.CONVERSATION, pinsChanged: true } });
    store.applyEvent({ event: { type: T.UPDATED, conversationId: T.OTHER_CONVERSATION, pinsChanged: true } });
    store.applyEvent({ event: { type: T.UPDATED, conversationId: T.CONVERSATION, pinsChanged: true } });

    expect(list).toHaveBeenCalledTimes(1);
  });
});
