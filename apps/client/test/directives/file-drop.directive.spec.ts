import { DestroyRef, Injector, runInInjectionContext } from '@angular/core';

import { FileDropDirective } from '../../src/app/features/support/directives/file-drop.directive';
import { FILE_DROP_TEST as T } from '../constants/file-drop.constant';
import { aDragEvent } from '../fakes/dom.fake';

const file = new File([T.CONTENT], T.FILE_NAME, { type: T.FILE_TYPE });

const prevent = jest.fn();

const dragEvent = (types: string[]): DragEvent => aDragEvent({ types, files: types.includes(T.FILES) ? [file] : [], preventDefault: prevent });

const create = (): FileDropDirective => {
  const injector = Injector.create({ providers: [{ provide: DestroyRef, useValue: { onDestroy: (): (() => void) => () => undefined } }] });
  return runInInjectionContext(injector, () => new FileDropDirective());
};

describe('FileDropDirective', () => {
  beforeEach(() => prevent.mockClear());

  it('keeps the overlay while the pointer moves between inner elements', () => {
    const directive = create();
    directive.onEnter(dragEvent([T.FILES]));
    directive.onEnter(dragEvent([T.FILES]));
    directive.onLeave(dragEvent([T.FILES]));

    expect(directive.dragging()).toBe(true);

    directive.onLeave(dragEvent([T.FILES]));
    expect(directive.dragging()).toBe(false);
  });

  it('hands dropped files over and hides the overlay', () => {
    const directive = create();
    const received: File[][] = [];
    directive.dropped.subscribe(files => received.push(files));
    const event = dragEvent([T.FILES]);

    directive.onEnter(event);
    directive.onDrop(event);

    expect(received).toEqual([[file]]);
    expect(directive.dragging()).toBe(false);
    expect(prevent).toHaveBeenCalled();
  });

  it('leaves dragged text alone', () => {
    const directive = create();
    const event = dragEvent([T.TEXT]);
    directive.onEnter(event);

    expect(directive.dragging()).toBe(false);
    expect(prevent).not.toHaveBeenCalled();
  });
});
