import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal, untracked } from '@angular/core';

import { LINK_PREVIEW } from '../../../core/constants/support/link-preview.constant';
import { LinkPreviewHelper } from '../../../core/helpers/support/link-preview.helper';
import { SupportLinkStore } from '../../../core/services/support-link.store';

@Component({
  selector: 'app-draft-link-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/draft-link-preview.component.html'
})
export class DraftLinkPreviewComponent {
  private readonly store = inject(SupportLinkStore);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly text = input('');
  readonly labels = LINK_PREVIEW;
  readonly url = signal<string | null>(null);
  readonly dismissed = signal<string | null>(null);
  readonly preview = computed(() => {
    const url = this.url();
    return url && url !== this.dismissed() ? this.store.preview({ url })() : null;
  });
  readonly host = computed(() => LinkPreviewHelper.host({ url: this.url() ?? LINK_PREVIEW.EMPTY }));

  constructor () {
    effect(() => {
      const next = LinkPreviewHelper.firstUrl({ text: this.text() });
      untracked(() => {
        if (this.timer) clearTimeout(this.timer);
        if (!next) {
          this.url.set(null);
          this.dismissed.set(null);
          return;
        }
        this.timer = setTimeout(() => this.url.set(next), LINK_PREVIEW.DEBOUNCE_MS);
      });
    });
  }

  dismiss (): void {
    this.dismissed.set(this.url());
  }
}
