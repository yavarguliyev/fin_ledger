import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { INFO_DIALOG } from '../../constants/info-dialog.constant';
import { INFO_PANEL } from '../../constants/info-panel.constant';
import { SupportAttachmentHelper } from '../../../../core/helpers/support/support-attachment.helper';
import { SupportStorageStore } from '../../../../core/services/support-storage.store';

@Component({
  selector: 'app-info-storage',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgOptimizedImage, ButtonComponent],
  templateUrl: '../../templates/info/info-storage.component.html'
})
export class InfoStorageComponent {
  readonly storage = inject(SupportStorageStore);
  readonly card = INFO_DIALOG.CARD;
  readonly labels = INFO_PANEL;
  readonly media = computed(() => (this.storage.summary()?.files ?? []).filter(file => INFO_PANEL.MEDIA_KINDS.includes(file.kind)));
  readonly documents = computed(() => (this.storage.summary()?.files ?? []).filter(file => !INFO_PANEL.MEDIA_KINDS.includes(file.kind)));

  size (bytes: number): string {
    return SupportAttachmentHelper.formatSize({ bytes });
  }
}
