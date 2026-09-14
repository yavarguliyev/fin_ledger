import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentMethod } from '../../../core/models/payment-method.model';
import { CardBrand, PaymentMethodType } from '../../../core/models/base.mode';
import { CardNumberInputComponent } from '../../../shared/components/card-number-input/card-number-input.component';
import { createRequiredValidator, createMinLengthValidator } from '../../../core/helpers/validators.helper';
import { parseExpiry } from '@/core/helpers/parse-expiry.helper';
import { formatExpiry } from '@/core/helpers/format-expiry.helper';
import { formatCvv } from '@/core/helpers/format-cvv.helper';
import { PAYMENT_METHOD_OPTIONS } from './utils/payment-method.util';

@Component({
  selector: 'app-add-payment-method-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardNumberInputComponent],
  templateUrl: './templates/add-payment-method-modal.component.html'
})
export class AddPaymentMethodModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly isOpen = input(false);
  readonly closeModal = output<void>();
  readonly methodAdded = output<PaymentMethod>();

  readonly methodTypes = PAYMENT_METHOD_OPTIONS;
  readonly selectedType = signal<PaymentMethodType>('BANK_ACCOUNT');
  readonly detectedBrand = signal<CardBrand>('unknown');
  readonly isCardValid = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.group({
    type: this.fb.nonNullable.control<PaymentMethodType>('BANK_ACCOUNT', { validators: [createRequiredValidator()] }),
    accountHolder: this.fb.nonNullable.control('', { validators: [createRequiredValidator(), createMinLengthValidator(2)] }),
    accountNumber: this.fb.nonNullable.control('', { validators: [createRequiredValidator(), createMinLengthValidator(4)] }),
    bankName: this.fb.nonNullable.control(''),
    expiry: this.fb.nonNullable.control(''),
    cvv: this.fb.nonNullable.control('')
  });

  isCardType (): boolean {
    const type = this.selectedType();
    return type === 'CREDIT_CARD' || type === 'DEBIT_CARD';
  }

  isWalletType (): boolean {
    const type = this.selectedType();
    return type === 'APPLE_PAY' || type === 'GOOGLE_PAY';
  }

  onBrandDetected (brand: CardBrand): void {
    this.detectedBrand.set(brand);
  }

  onCardValidChange (valid: boolean): void {
    this.isCardValid.set(valid);
  }

  onExpiryInput (event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const formatted = formatExpiry(event.target.value);
    event.target.value = formatted;
    this.form.controls.expiry.setValue(formatted);
  }

  onCvvInput (event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const formatted = formatCvv(event.target.value, this.detectedBrand());
    event.target.value = formatted;
    this.form.controls.cvv.setValue(formatted);
  }

  setType (type: PaymentMethodType): void {
    this.selectedType.set(type);
    this.form.controls.type.setValue(type);
    this.detectedBrand.set('unknown');
    this.isCardValid.set(false);

    if (type === 'BANK_ACCOUNT' && !this.form.controls.bankName.value) {
      this.form.controls.bankName.setValue('Chase Bank');
    }
  }

  resetForm (type: PaymentMethodType = 'BANK_ACCOUNT'): void {
    this.selectedType.set(type);
    this.detectedBrand.set('unknown');
    this.isCardValid.set(false);

    const user = this.auth.currentUser();
    const accountHolder = user ? user.displayName : '';
    const bankName = type === 'BANK_ACCOUNT' ? 'Chase Bank' : '';

    this.form.reset({ type, accountHolder, accountNumber: '', bankName, expiry: '', cvv: '' });
  }

  close (): void {
    this.resetForm();
    this.closeModal.emit();
  }

  submit (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { type, accountHolder, accountNumber, bankName, expiry, cvv } = this.form.getRawValue();
    const parsed = expiry ? parseExpiry(expiry) : null;

    this.paymentMethodService
      .create({
        type,
        accountHolder,
        accountNumber,
        bankName: type === 'BANK_ACCOUNT' ? bankName : undefined,
        ...(parsed ? { expiryMonth: parsed.month, expiryYear: parsed.year } : {}),
        ...(cvv ? { cvv } : {})
      })
      .subscribe({
        next: method => {
          this.toast.success('Payment method added successfully');
          this.submitting.set(false);
          this.resetForm();
          this.methodAdded.emit(method);
          this.close();
        },
        error: (err: Error) => {
          this.submitting.set(false);
          this.toast.error(err.message || 'Failed to add payment method');
        }
      });
  }
}
