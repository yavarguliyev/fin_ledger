import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

import { FOCUS_TRAP } from '../../core/constants/ui/focus-trap.constant';
import { FocusTrapHelper } from '../../core/helpers/ui/focus-trap.helper';

@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
  host: { '(keydown)': 'onKeydown($event)' }
})
export class FocusTrapDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private previous: HTMLElement | null = null;

  ngOnInit (): void {
    this.previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    queueMicrotask(() => (this.focusables()[0] ?? this.focusHost()).focus());
  }

  ngOnDestroy (): void {
    if (this.previous?.isConnected) this.previous.focus();
  }

  onKeydown (event: KeyboardEvent): void {
    if (event.key !== FOCUS_TRAP.TAB_KEY) return;

    const focusables = this.focusables();
    const current = focusables.indexOf(document.activeElement as HTMLElement);
    const target = FocusTrapHelper.wrapTo({ count: focusables.length, current, backwards: event.shiftKey });
    if (target === null) return;

    event.preventDefault();
    focusables[target]?.focus();
  }

  private focusables (): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUS_TRAP.FOCUSABLE));
  }

  private focusHost (): HTMLElement {
    const element = this.host.nativeElement;
    if (!element.hasAttribute(FOCUS_TRAP.TAB_INDEX_ATTRIBUTE)) element.setAttribute(FOCUS_TRAP.TAB_INDEX_ATTRIBUTE, FOCUS_TRAP.HOST_TAB_INDEX);
    return element;
  }
}
