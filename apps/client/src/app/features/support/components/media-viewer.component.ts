import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';

import { FocusTrapDirective } from '../../../shared/directives/focus-trap.directive';
import { MEDIA_VIEWER } from '../constants/media-viewer.constant';
import { MediaViewerService } from '../services/media-viewer.service';
import { SUPPORT_ATTACHMENT } from '../../../core/constants/support/support-attachment.constant';
import { SupportMessage } from '../../../core/types/support/support-message.type';

@Component({
  selector: 'app-media-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgOptimizedImage, FocusTrapDirective],
  templateUrl: '../templates/media-viewer.component.html',
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
    '(document:keydown.arrowleft)': 'viewer.previous()',
    '(document:keydown.arrowright)': 'viewer.next()'
  }
})
export class MediaViewerComponent {
  readonly viewer = inject(MediaViewerService);
  readonly userId = input('');
  readonly labels = MEDIA_VIEWER;

  onEscape (event: Event): void {
    if (!this.viewer.current()) return;
    event.stopImmediatePropagation();
    this.viewer.close();
  }

  isImage (message: SupportMessage): boolean {
    return message.kind === SUPPORT_ATTACHMENT.IMAGE_KIND;
  }

  sender (message: SupportMessage): string {
    return message.senderUserId === this.userId() ? MEDIA_VIEWER.YOU : (message.senderName ?? '');
  }
}
