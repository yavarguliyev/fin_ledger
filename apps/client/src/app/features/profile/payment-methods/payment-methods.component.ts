import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentMethod } from '../../../core/models/payment-method.model';
import { AddPaymentMethodModalComponent } from './add-payment-method-modal.component';
import { getPaymentMethodLabel } from './utils/payment-method.util';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, AddPaymentMethodModalComponent],
  templateUrl: './templates/payment-methods.component.html'
})
export class PaymentMethodsComponent implements OnInit {
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly toast = inject(ToastService);

  readonly methods = signal<PaymentMethod[]>([]);
  readonly loading = signal(true);
  readonly showAddModal = signal(false);

  ngOnInit (): void {
    this.checkSessionReturn();
    this.loadMethods();
  }

  getTypeLabel (method: PaymentMethod): string {
    return getPaymentMethodLabel(method);
  }

  openAddModal (): void {
    this.showAddModal.set(true);
  }

  closeAddModal (): void {
    this.showAddModal.set(false);
  }

  onMethodAdded (): void {
    this.showAddModal.set(false);
    this.loadMethods();
  }

  loadMethods (): void {
    this.loading.set(true);
    this.paymentMethodService.list().subscribe({
      next: data => {
        this.methods.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  verifyMethod (id: string): void {
    this.paymentMethodService.verify(id).subscribe({
      next: () => {
        this.toast.success('Payment method verified!');
        this.loadMethods();
      },
      error: (err: Error) => this.toast.error(err.message || 'Verification failed')
    });
  }

  removeMethod (id: string): void {
    this.paymentMethodService.remove(id).subscribe({
      next: () => {
        this.toast.success('Payment method removed');
        this.loadMethods();
      },
      error: (err: Error) => this.toast.error(err.message || 'Failed to remove')
    });
  }

  private checkSessionReturn (): void {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const status = params.get('status');

    if (sessionId && status === 'success') {
      this.paymentMethodService.confirmSetupSession('stripe', sessionId).subscribe({
        next: () => {
          this.toast.success('Payment method verified and linked successfully with Stripe!');
          this.loadMethods();
          window.history.replaceState({}, document.title, window.location.pathname);
        },
        error: (err: Error) => {
          this.toast.error(err.message || 'Failed to verify session with provider');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }
}
