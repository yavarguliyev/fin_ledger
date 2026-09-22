import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentMethod } from '../../../core/interfaces/payment-method/payment-method.interface';
import { ProviderOption } from '../../../core/interfaces/payment-method/provider-option.interface';

@Component({
  selector: 'app-add-payment-method-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './templates/add-payment-method-modal.component.html'
})
export class AddPaymentMethodModalComponent {
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly toast = inject(ToastService);

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

    this.paymentMethodService.createSetupSession(provider, returnUrl).subscribe({
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
