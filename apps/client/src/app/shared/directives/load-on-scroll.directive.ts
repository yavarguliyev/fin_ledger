import { Directive, ElementRef, OnDestroy, OnInit, inject, input, output } from '@angular/core';

import { LOAD_ON_SCROLL } from '../../core/constants/ui/load-on-scroll.constant';

@Directive({
  selector: '[appLoadOnScroll]',
  standalone: true
})
export class LoadOnScrollDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: IntersectionObserver | null = null;

  readonly paused = input<boolean>(false);
  readonly reached = output<void>();

  ngOnInit (): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      entries => {
        if (!this.paused() && entries.some(entry => entry.isIntersecting)) this.reached.emit();
      },
      { rootMargin: LOAD_ON_SCROLL.ROOT_MARGIN }
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy (): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
