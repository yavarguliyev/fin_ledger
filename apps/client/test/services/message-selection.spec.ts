import { Injector, runInInjectionContext, signal } from '@angular/core';

import { MessageSelectionService } from '../../src/app/features/support/services/message-selection.service';
import { SupportChatStore } from '../../src/app/core/services/support-chat.store';
import { SupportMessage } from '../../src/app/core/types/support/support-message.type';
import { MESSAGE_SELECTION_TEST as T } from '../constants/message-selection.constant';
import { aSupportMessage } from '../fakes/support.fake';

const activeId = signal<string>(T.CONVERSATION);
const messages = (): SupportMessage[] => [
  aSupportMessage({ id: T.MINE_ONE, senderUserId: T.ME }),
  aSupportMessage({ id: T.MINE_TWO, senderUserId: T.ME }),
  aSupportMessage({ id: T.THEIRS, senderUserId: T.PEER }),
  aSupportMessage({ id: T.SYSTEM, kind: T.SYSTEM_KIND })
];

const create = (): MessageSelectionService => {
  const injector = Injector.create({ providers: [{ provide: SupportChatStore, useValue: { activeId, messages, myUserId: (): string => T.ME } }] });
  return runInInjectionContext(injector, () => new MessageSelectionService());
};

describe('MessageSelectionService', () => {
  beforeEach(() => activeId.set(T.CONVERSATION));

  it('starts with the picked message and toggles others in and out', () => {
    const selection = create();
    selection.start({ messageIds: [T.MINE_ONE] });
    selection.toggle({ messageIds: [T.MINE_TWO] });
    selection.toggle({ messageIds: [T.MINE_ONE] });

    expect(selection.active()).toBe(true);
    expect(selection.selected().map(message => message.id)).toEqual([T.MINE_TWO]);
  });

  it('asks to delete any selection, and cancelling a quick album delete leaves selection mode', () => {
    const selection = create();
    selection.start({ messageIds: [T.MINE_ONE] });
    selection.toggle({ messageIds: [T.THEIRS] });
    selection.ask();
    expect(selection.asking()).toBe(true);
    selection.dismiss();
    expect(selection.active()).toBe(true);

    selection.remove({ messageIds: [T.MINE_ONE, T.MINE_TWO] });
    expect(selection.count()).toBe(2);
    selection.dismiss();
    expect(selection.active()).toBe(false);
  });

  it('toggles a whole group of ids together', () => {
    const selection = create();
    selection.start({ messageIds: [T.THEIRS] });
    selection.toggle({ messageIds: [T.MINE_ONE, T.MINE_TWO] });
    expect(selection.count()).toBe(3);

    selection.toggle({ messageIds: [T.MINE_ONE, T.MINE_TWO] });
    expect(selection.selected().map(message => message.id)).toEqual([T.THEIRS]);
  });

});

describe('MessageSelectionService scope', () => {
  beforeEach(() => activeId.set(T.CONVERSATION));

  it('does not offer system notices or deleted messages for selection', () => {
    const selection = create();

    expect(selection.selectable(aSupportMessage({ kind: T.SYSTEM_KIND }))).toBe(false);
    expect(selection.selectable(aSupportMessage({ deletedAt: T.CONVERSATION }))).toBe(false);
  });

  it('leaves selection mode when another chat opens', () => {
    const selection = create();
    selection.start({ messageIds: [T.MINE_ONE] });

    activeId.set(T.OTHER_CONVERSATION);

    expect(selection.active()).toBe(false);
    expect(selection.count()).toBe(0);
  });
});
