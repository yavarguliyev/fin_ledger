import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';

import { PENDING_UPLOAD } from '../../../core/constants/support/pending-upload.constant';
import { PendingUpload } from '../../../core/interfaces/support/pending-upload.interface';
import { SupportAttachmentHelper } from '../../../core/helpers/support/support-attachment.helper';
import { THREAD_BUBBLE } from '../constants/thread-bubble.constant';

@Component({
  selector: 'app-pending-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/pending-upload.component.html'
})
export class PendingUploadComponent {
  readonly upload = input.required<PendingUpload>();
  readonly progress = input(0);
  readonly cancelled = output();

  readonly labels = PENDING_UPLOAD;
  readonly bubble = THREAD_BUBBLE.OWN;
  readonly circumference = 2 * Math.PI * PENDING_UPLOAD.RING_RADIUS;
  readonly media = computed(() => this.upload().files.filter(file => file.objectUrl));
  readonly documents = computed(() => this.upload().files.filter(file => !file.objectUrl));
  readonly shown = computed(() => this.media().slice(0, PENDING_UPLOAD.ALBUM_LIMIT));
  readonly hidden = computed(() => this.media().length - this.shown().length);
  readonly dashOffset = computed(() => this.circumference * (1 - Math.min(this.progress(), PENDING_UPLOAD.PERCENT_MAX) / PENDING_UPLOAD.PERCENT_MAX));

  size (bytes: number): string {
    return SupportAttachmentHelper.formatSize({ bytes });
  }
}
