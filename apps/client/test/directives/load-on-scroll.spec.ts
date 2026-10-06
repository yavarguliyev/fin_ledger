import { ElementRef, Injector, runInInjectionContext } from '@angular/core';

import { LoadOnScrollDirective } from '../../src/app/shared/directives/load-on-scroll.directive';
import { LOAD_ON_SCROLL_TEST as T } from '../constants/load-on-scroll.constant';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let callback: ObserverCallback = () => undefined;
const observe = jest.fn();
const disconnect = jest.fn();

class FakeObserver {
  constructor (handler: ObserverCallback) {
    callback = handler;
  }

  observe = observe;
  disconnect = disconnect;
}

const create = (): LoadOnScrollDirective =>
  runInInjectionContext(Injector.create({ providers: [{ provide: ElementRef, useValue: new ElementRef({}) }] }), () => new LoadOnScrollDirective());

describe('LoadOnScrollDirective', () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>)['IntersectionObserver'] = FakeObserver;
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>)['IntersectionObserver'];
    jest.clearAllMocks();
  });

  it('asks for the next page only when the end of the list scrolls into view', () => {
    const directive = create();
    const reached = jest.fn();
    directive.reached.subscribe(reached);
    directive.ngOnInit();

    callback([{ isIntersecting: false }]);
    expect(reached).not.toHaveBeenCalled();

    callback([{ isIntersecting: true }]);
    expect(reached).toHaveBeenCalledTimes(T.ONE_CALL);
  });

  it('stops watching when the list goes away', () => {
    const directive = create();
    directive.ngOnInit();
    directive.ngOnDestroy();

    expect(observe).toHaveBeenCalledTimes(T.ONE_CALL);
    expect(disconnect).toHaveBeenCalledTimes(T.ONE_CALL);
  });
});
