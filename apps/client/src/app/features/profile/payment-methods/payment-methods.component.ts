import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StepUpRetryService } from '../../../core/services/step-up-retry.service';
import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentMethod } from '../../../core/types/payment-method/payment-method.type';
import { AddPaymentMethodModalComponent } from './add-payment-method-modal.component';
import { PaymentMethodHelper } from './helpers/payment-method.helper';
import { PAYMENT_PROVIDERS } from '../../../core/constants/payment/payment-providers.constant';
import { PAYMENT_METHOD_LABELS } from '../../../core/constants/payment/payment-method-labels.constant';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../../core/constants/ui/load-state.constant';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, AddPaymentMethodModalComponent, ErrorStateComponent],
  templateUrl: './templates/payment-methods.component.html'
})
export class PaymentMethodsComponent implements OnInit {
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly stepUp = inject(StepUpRetryService);
  private readonly toast = inject(ToastService);

  readonly methods = signal<PaymentMethod[]>([]);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly states = LOAD_STATE;
  readonly showAddModal = signal(false);

  ngOnInit (): void {
    this.checkSessionReturn();
    this.loadMethods();
  }

  getTypeLabel (method: PaymentMethod): string {
    return PaymentMethodHelper.getPaymentMethodLabel({ method });
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
    this.failed.set(false);
    this.paymentMethodService.list().subscribe({
      next: data => {
        this.methods.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.failed.set(true);
      }
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

  confirmRemove (method: PaymentMethod): void {
    this.toast.confirm({ message: PaymentMethodHelper.removalPrompt({ method }), onConfirm: () => this.removeMethod(method.id) });
  }

  private removeMethod (id: string): void {
    this.paymentMethodService.remove(id).subscribe({
      next: () => {
        this.toast.success(PAYMENT_METHOD_LABELS.REMOVED);
        this.loadMethods();
      },
      error: (err: Error) => this.toast.error(err.message || PAYMENT_METHOD_LABELS.REMOVE_FAILED)
    });
  }

  private checkSessionReturn (): void {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const status = params.get('status');

    if (sessionId && status === 'success') {
      this.stepUp.guard({ request: this.paymentMethodService.confirmSetupSession({ provider: PAYMENT_PROVIDERS.STRIPE, sessionId }) }).subscribe({
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
