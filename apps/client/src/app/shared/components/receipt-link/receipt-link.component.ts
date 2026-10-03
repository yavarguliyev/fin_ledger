import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';

import { RECEIPT } from '../../../core/constants/payment/receipt.constant';
import { ReceiptHelper } from '../../../core/helpers/payment/receipt.helper';
import { ReceiptService } from '../../../core/services/receipt.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReceiptViewerStore } from '../../../core/services/receipt-viewer.store';

@Component({
  selector: 'app-receipt-link',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './receipt-link.component.html'
})
export class ReceiptLinkComponent {
  private readonly receipts = inject(ReceiptService);
  private readonly toast = inject(ToastService);
  private readonly viewer = inject(ReceiptViewerStore);

  readonly reference = input<string | null>(null);
  readonly status = input<string>('');

  readonly text = RECEIPT;
  readonly paymentId = computed(() =>
    this.status() === RECEIPT.COMPLETED_STATUS ? ReceiptHelper.paymentIdFrom({ reference: this.reference() }) : null
  );

  view (event: Event): void {
    event.stopPropagation();
    const paymentId = this.paymentId();
    if (paymentId) this.viewer.open({ paymentId });
  }

  download (event: Event): void {
    event.stopPropagation();
    const paymentId = this.paymentId();
    if (!paymentId) return;
    this.receipts.download({ paymentId }).subscribe({ error: () => this.toast.error(RECEIPT.FAILED) });
  }
}
