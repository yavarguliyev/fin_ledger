import { ElementRef, Injector, runInInjectionContext, signal } from '@angular/core';

import { ChatSearchComponent } from '../../src/app/features/support/components/chat-search.component';
import { ChatSearchService } from '../../src/app/features/support/services/chat-search.service';
import { aMouseEvent } from '../fakes/dom.fake';

const inside = {};
const outside = {};
const toggle = jest.fn();

const create = (): ChatSearchComponent => {
  const injector = Injector.create({
    providers: [
      { provide: ElementRef, useValue: { nativeElement: { contains: (node: unknown): boolean => node === inside } } },
      { provide: ChatSearchService, useValue: { open: signal(true), toggle } }
    ]
  });
  return runInInjectionContext(injector, () => new ChatSearchComponent());
};

const clickOn = (target: object): MouseEvent => aMouseEvent({ target });

describe('Chat search panel', () => {
  beforeEach(() => toggle.mockClear());

  it('closes when the user clicks anywhere outside it', () => {
    create().onDocumentClick(clickOn(outside));

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('stays open while the user clicks inside it', () => {
    create().onDocumentClick(clickOn(inside));

    expect(toggle).not.toHaveBeenCalled();
  });
});
