import { Injectable, inject, signal } from '@angular/core';

import { RECEIPT } from '../constants/payment/receipt.constant';
import { ReceiptDownloadDto } from '../interfaces/payment/receipt-download.interface';
import { ReceiptService } from './receipt.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ReceiptViewerStore {
  private readonly receipts = inject(ReceiptService);
  private readonly toast = inject(ToastService);

  readonly isOpen = signal(false);
  readonly loading = signal(false);
  readonly url = signal<string | null>(null);
  readonly paymentId = signal<string | null>(null);

  open ({ paymentId }: ReceiptDownloadDto): void {
    this.release();
    this.paymentId.set(paymentId);
    this.isOpen.set(true);
    this.loading.set(true);

    this.receipts.load({ paymentId }).subscribe({
      next: url => {
        this.url.set(url);
        this.loading.set(false);
      },
      error: () => {
        this.close();
        this.toast.error(RECEIPT.FAILED);
      }
    });
  }

  download (): void {
    const paymentId = this.paymentId();
    const url = this.url();
    if (paymentId && url) this.receipts.save({ paymentId, url });
  }

  close (): void {
    this.isOpen.set(false);
    this.loading.set(false);
    this.release();
    this.paymentId.set(null);
  }

  private release (): void {
    const url = this.url();
    if (url) URL.revokeObjectURL(url);
    this.url.set(null);
  }
}
