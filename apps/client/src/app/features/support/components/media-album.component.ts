import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { ALBUM } from '../../../core/constants/support/album.constant';
import { SupportMessage } from '../../../core/types/support/support-message.type';

@Component({
  selector: 'app-media-album',
  standalone: true,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/media-album.component.html'
})
export class MediaAlbumComponent {
  readonly messages = input.required<SupportMessage[]>();
  readonly opened = output<string>();
  readonly labels = ALBUM;
  readonly shown = computed(() => this.messages().slice(0, ALBUM.VISIBLE_ITEMS));
  readonly hidden = computed(() => this.messages().length - this.shown().length);
}
