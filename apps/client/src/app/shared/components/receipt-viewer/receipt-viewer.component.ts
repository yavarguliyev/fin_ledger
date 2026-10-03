import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { RECEIPT } from '../../../core/constants/payment/receipt.constant';
import { ReceiptViewerStore } from '../../../core/services/receipt-viewer.store';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-receipt-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent],
  templateUrl: './receipt-viewer.component.html'
})
export class ReceiptViewerComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly store = inject(ReceiptViewerStore);
  readonly text = RECEIPT;
  readonly safeUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.store.url();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${RECEIPT.VIEWER_FRAGMENT}`) : null;
  });
}
