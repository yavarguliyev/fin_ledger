import { Injectable, signal } from '@angular/core';

import { PageTitleDto } from '../interfaces/ui/page-title.interface';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private readonly current = signal<PageTitleDto | null>(null);

  readonly page = this.current.asReadonly();

  set (page: PageTitleDto): void {
    this.current.set(page);
  }

  release (page: PageTitleDto): void {
    if (this.current() === page) this.current.set(null);
  }
}
