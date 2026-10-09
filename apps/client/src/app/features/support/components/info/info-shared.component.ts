import { Component, ChangeDetectionStrategy, computed, inject, output } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';

import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { INFO_PANEL } from '../../constants/info-panel.constant';
import { LinkPreviewHelper } from '../../../../core/helpers/support/link-preview.helper';
import { LoadOnScrollDirective } from '../../../../shared/directives/load-on-scroll.directive';
import { MonthGroupHelper } from '../../helpers/month-group.helper';
import { SUPPORT_ATTACHMENT } from '../../../../core/constants/support/support-attachment.constant';
import { SUPPORT_PANEL } from '../../../../core/constants/support/support-panel.constant';
import { SupportAttachmentHelper } from '../../../../core/helpers/support/support-attachment.helper';
import { SupportMessage } from '../../../../core/types/support/support-message.type';
import { SupportPanelStore } from '../../../../core/services/support-panel.store';
import { MediaGalleryHelper } from '../../../../core/helpers/support/media-gallery.helper';
import { MediaViewerService } from '../../services/media-viewer.service';
import { MessageIdRefDto } from '../../../../core/interfaces/support/message-id-ref.interface';

@Component({
  selector: 'app-info-shared',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgOptimizedImage, LoadOnScrollDirective],
  templateUrl: '../../templates/info/info-shared.component.html'
})
export class InfoSharedComponent {
  readonly panel = inject(SupportPanelStore);
  readonly jump = output<string>();
  private readonly viewer = inject(MediaViewerService);

  openMedia ({ messageId }: MessageIdRefDto): void {
    this.viewer.open({ items: MediaGalleryHelper.items({ messages: this.panel.media() }), messageId });
  }
  readonly labels = INFO_DIALOG;
  readonly tabs = SUPPORT_PANEL.TABS;
  readonly card = INFO_DIALOG.CARD;
  readonly dateFormat = INFO_PANEL.DATE_FORMAT;
  readonly mediaGroups = computed(() => MonthGroupHelper.group({ items: this.panel.media(), now: new Date() }));
  readonly linkGroups = computed(() => MonthGroupHelper.group({ items: this.panel.links(), now: new Date() }));
  readonly docGroups = computed(() => MonthGroupHelper.group({ items: this.panel.docs(), now: new Date() }));
  readonly complete = computed(() => !this.panel.hasMore()[this.panel.tab()] && !this.panel.loading());
  readonly mediaSummary = computed(() => {
    const photos = this.panel.media().filter(item => this.isImage(item)).length;
    const videos = this.panel.media().length - photos;
    return [photos ? `${photos} ${INFO_DIALOG.PHOTOS}` : '', videos ? `${videos} ${INFO_DIALOG.VIDEOS}` : ''].filter(Boolean).join(INFO_DIALOG.COUNT_SEPARATOR);
  });
  readonly emptyText = computed(() => INFO_DIALOG.EMPTY[this.panel.tab() as keyof typeof INFO_DIALOG.EMPTY] ?? '');

  isImage (message: SupportMessage): boolean {
    return message.kind === SUPPORT_ATTACHMENT.IMAGE_KIND;
  }

  duration (seconds: number | null | undefined): string {
    const total = Math.max(0, Math.round(seconds ?? 0));
    const rest = String(total % INFO_DIALOG.SECONDS_PER_MINUTE).padStart(INFO_DIALOG.SECONDS_PAD, INFO_DIALOG.PAD_CHAR);
    return `${Math.floor(total / INFO_DIALOG.SECONDS_PER_MINUTE)}${INFO_DIALOG.TIME_SEPARATOR}${rest}`;
  }

  size (bytes: number): string {
    return SupportAttachmentHelper.formatSize({ bytes });
  }

  host (url: string): string {
    return LinkPreviewHelper.host({ url });
  }

  fileLabel (message: SupportMessage): string {
    if (message.kind === SUPPORT_ATTACHMENT.VOICE_KIND) return INFO_PANEL.VOICE_NAME;
    return message.attachment?.fileName ?? INFO_PANEL.ATTACHMENT_LABEL;
  }
}
