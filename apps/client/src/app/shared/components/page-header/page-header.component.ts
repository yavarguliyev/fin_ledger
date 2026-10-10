import { Component, ChangeDetectionStrategy, DestroyRef, effect, inject, input } from '@angular/core';

import { PageTitleDto } from '../../../core/interfaces/ui/page-title.interface';
import { PageTitleService } from '../../../core/services/page-title.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { hidden: '' },
  template: ''
})
export class PageHeaderComponent {
  private readonly pageTitle = inject(PageTitleService);
  private entry: PageTitleDto | null = null;

  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly backRoute = input<string>();
  readonly backLabel = input<string>();

  constructor () {
    effect(() => {
      const subtitle = this.subtitle();
      const backRoute = this.backRoute();
      const backLabel = this.backLabel();
      this.entry = { title: this.title(), ...(subtitle && { subtitle }), ...(backRoute && { backRoute }), ...(backLabel && { backLabel }) };
      this.pageTitle.set(this.entry);
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.entry) this.pageTitle.release(this.entry);
    });
  }
}
