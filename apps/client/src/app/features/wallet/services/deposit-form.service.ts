import { Injectable, computed, inject, signal } from '@angular/core';

import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { PaymentMethod } from '../../../core/types/payment-method/payment-method.type';
import { PaymentRequest } from '../../../core/interfaces/wallet/payment-request.interface';
import { BuildPaymentPayloadDto } from '../interfaces/build-payment-payload.interface';
import { PaymentMethodHelper } from '../../profile/payment-methods/helpers/payment-method.helper';

@Injectable()
export class DepositFormService {
  private readonly paymentMethodService = inject(PaymentMethodService);

  readonly step = signal(1);
  readonly selectedMethodId = signal<string | null>(null);
  readonly loadingMethods = signal(true);
  readonly methodsFailed = signal(false);
  readonly paymentMethods = signal<PaymentMethod[]>([]);

  readonly quickAmounts = [1000, 5000, 10000, 50000];
  readonly verifiedMethods = computed(() => this.paymentMethods().filter(method => method.status === 'VERIFIED'));

  readonly steps = [
    { idx: 1, label: 'Amount' },
    { idx: 2, label: 'Payment Method' },
    { idx: 3, label: 'Confirm' }
  ];

  selectMethod (id: string): void {
    this.selectedMethodId.set(id);
  }

  getSourceLabel (): string {
    const method = this.paymentMethods().find(m => m.id === this.selectedMethodId());

    if (method) {
      const typeLabel = method.bankName || (method.type === 'BANK_ACCOUNT' ? 'Bank Account' : 'Debit Card');
      return `${typeLabel} (${PaymentMethodHelper.maskedAccount({ method })})`;
    }

    return '—';
  }

  loadPaymentMethods (): void {
    this.loadingMethods.set(true);
    this.methodsFailed.set(false);
    this.paymentMethodService.list().subscribe({
      next: methods => {
        this.paymentMethods.set(methods);
        this.loadingMethods.set(false);

        const verified = methods.filter(m => m.status === 'VERIFIED');
        const defaultMethod = verified.find(m => m.isDefault) ?? verified[0];

        if (defaultMethod) this.selectedMethodId.set(defaultMethod.id);
      },
      error: () => {
        this.loadingMethods.set(false);
        this.methodsFailed.set(true);
      }
    });
  }

  buildPayload ({ amountMinor, currency, idempotencyKey }: BuildPaymentPayloadDto): PaymentRequest {
    const method = this.paymentMethods().find(m => m.id === this.selectedMethodId());

    return {
      amountMinor,
      currency,
      paymentMethodId: this.selectedMethodId() ?? undefined,
      idempotencyKey,
      metadata: {
        destination: method?.type ?? 'bank_account',
        maskedAccount: method ? PaymentMethodHelper.maskedAccount({ method }) : '',
        accountHolder: method?.accountHolder ?? ''
      }
    };
  }
}
