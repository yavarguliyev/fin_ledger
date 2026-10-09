import { Directive, ElementRef, Renderer2, inject } from '@angular/core';

import { NATURAL_ASPECT } from '../constants/natural-aspect.constant';

@Directive({
  selector: 'img[appNaturalAspect]',
  standalone: true,
  host: { '(load)': 'onLoad()' }
})
export class NaturalAspectDirective {
  private readonly host = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  onLoad (): void {
    const image = this.host.nativeElement;
    if (!image.naturalWidth || !image.naturalHeight || !image.parentElement) return;
    const ratio = Math.min(NATURAL_ASPECT.MAX_RATIO, Math.max(NATURAL_ASPECT.MIN_RATIO, image.naturalWidth / image.naturalHeight));
    this.renderer.setStyle(image.parentElement, NATURAL_ASPECT.PROPERTY, String(ratio));
  }
}
