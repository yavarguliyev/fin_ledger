import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';

import { LINK_PREVIEW } from '../../../core/constants/support/link-preview.constant';
import { LinkPreviewHelper } from '../../../core/helpers/support/link-preview.helper';
import { SupportLinkStore } from '../../../core/services/support-link.store';

@Component({
  selector: 'app-link-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/link-preview.component.html'
})
export class LinkPreviewComponent {
  private readonly store = inject(SupportLinkStore);

  readonly url = input.required<string>();
  readonly link = LINK_PREVIEW;
  readonly preview = computed(() => this.store.preview({ url: this.url() })());
  readonly host = computed(() => LinkPreviewHelper.host({ url: this.url() }));
}
