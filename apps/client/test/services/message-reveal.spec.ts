import { Injector, runInInjectionContext } from '@angular/core';

import { MessageRevealService } from '../../src/app/features/support/services/message-reveal.service';
import { SupportHistoryService } from '../../src/app/core/services/support-history.service';
import { ToastService } from '../../src/app/core/services/toast.service';
import { CHAT_SEARCH_TEST as T } from '../constants/chat-search.constant';

const info = jest.fn();
const elements = new Map<string, unknown>();

const create = (): MessageRevealService => {
  const injector = Injector.create({
    providers: [
      { provide: SupportHistoryService, useValue: { canLoadMore: (): boolean => false, loadingOlder: (): boolean => false, loadOlder: jest.fn() } },
      { provide: ToastService, useValue: { info } }
    ]
  });
  return runInInjectionContext(injector, () => new MessageRevealService());
};

describe('MessageRevealService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    info.mockClear();
    elements.clear();
    (globalThis as unknown as { document: unknown }).document = { getElementById: (id: string): unknown => elements.get(id) ?? null };
  });

  afterEach(() => jest.useRealTimers());

  it('scrolls to a loaded message and highlights it briefly', () => {
    const classes = new Set<string>();
    const scrollIntoView = jest.fn();
    elements.set(`${T.PREFIX}${T.MESSAGE_ID}`, {
      scrollIntoView,
      classList: { add: (...names: string[]): void => names.forEach(name => classes.add(name)), remove: (...names: string[]): void => names.forEach(name => classes.delete(name)) }
    });

    create().reveal({ messageId: T.MESSAGE_ID });

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(classes.has(T.FLASH_CLASS)).toBe(true);
    jest.runAllTimers();
    expect(classes.has(T.FLASH_CLASS)).toBe(false);
  });

  it('says so when the message is older than everything that can be loaded', () => {
    create().reveal({ messageId: T.MISSING_ID });

    expect(info).toHaveBeenCalledTimes(1);
  });
});
