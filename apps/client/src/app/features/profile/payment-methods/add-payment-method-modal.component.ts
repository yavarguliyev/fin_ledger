import { Component, ChangeDetectionStrategy, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentMethod } from '../../../core/types/payment-method/payment-method.type';
import { ProviderOption } from '../../../core/interfaces/payment-method/provider-option.interface';
import { FocusTrapDirective } from '../../../shared/directives/focus-trap.directive';
import { MODAL } from '../../../core/constants/ui/modal.constant';

@Component({
  selector: 'app-add-payment-method-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FocusTrapDirective],
  templateUrl: './templates/add-payment-method-modal.component.html'
})
export class AddPaymentMethodModalComponent {
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly toast = inject(ToastService);
  readonly modalLabels = MODAL;
  readonly titleId = MODAL.ADD_PAYMENT_TITLE_ID;

  readonly selectedProvider = signal<string>('stripe');
  readonly submitting = signal(false);

  readonly isOpen = input(false);
  readonly closeModal = output<void>();
  readonly methodAdded = output<PaymentMethod>();

  readonly availableProviders: readonly ProviderOption[] = [
    { id: 'stripe', label: 'Stripe' },
    { id: 'apple_pay', label: 'Apple Pay' },
    { id: 'google_pay', label: 'Google Pay' }
  ];

  selectProvider (providerId: string): void {
    this.selectedProvider.set(providerId);
  }

  close (): void {
    this.submitting.set(false);
    this.closeModal.emit();
  }

  redirectToProvider (provider: string): void {
    this.submitting.set(true);
    const returnUrl = `${window.location.origin}/profile`;

    this.paymentMethodService.createSetupSession({ provider, returnUrl }).subscribe({
      next: (res: { url: string; sessionId: string }) => {
        if (res.url) {
          window.location.href = res.url;
        } else {
          this.submitting.set(false);
          this.toast.error('Failed to get session URL from provider');
        }
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.toast.error(err.message || 'Failed to initiate payment provider session');
      }
    });
  }
}
