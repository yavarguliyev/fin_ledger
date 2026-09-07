import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentMethod } from '../../../core/models/payment-method.model';
import { createRequiredValidator, createMinLengthValidator } from '../../../core/utils/validators.util';
import { PaymentMethodType } from '../../../core/models/base.mode';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './templates/payment-methods.component.html'
})
export class PaymentMethodsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly methods = signal<PaymentMethod[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly showAddModal = signal(false);
  readonly selectedType = signal<PaymentMethodType>('BANK_ACCOUNT');

  readonly form = this.fb.group({
    type: this.fb.nonNullable.control<PaymentMethodType>('BANK_ACCOUNT', { validators: [createRequiredValidator()] }),
    accountHolder: this.fb.nonNullable.control('', { validators: [createRequiredValidator(), createMinLengthValidator(2)] }),
    accountNumber: this.fb.nonNullable.control('', { validators: [createRequiredValidator(), createMinLengthValidator(4)] }),
    bankName: this.fb.nonNullable.control('')
  });

  ngOnInit (): void {
    this.loadMethods();
  }

  closeAddModal (): void {
    this.showAddModal.set(false);
  }

  setType (type: PaymentMethodType): void {
    this.selectedType.set(type);
    this.form.controls.type.setValue(type);
    if (type === 'BANK_ACCOUNT' && !this.form.controls.bankName.value) this.form.controls.bankName.setValue('Chase Bank');
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

  removeMethod (id: string): void {
    this.paymentMethodService.remove(id).subscribe({
      next: () => {
        this.toast.success('Payment method removed');
        this.loadMethods();
      },
      error: (err: Error) => this.toast.error(err.message || 'Failed to remove')
    });
  }

  openAddModal (type: PaymentMethodType = 'BANK_ACCOUNT'): void {
    this.selectedType.set(type);

    const accountHolder = this.auth.currentUser()?.displayName ?? '';
    const bankName = type === 'BANK_ACCOUNT' ? 'Chase Bank' : '';

    this.form.reset({ type, accountHolder, accountNumber: '', bankName });
    this.showAddModal.set(true);
  }

  submitNewMethod (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { type, accountHolder, accountNumber, bankName } = this.form.getRawValue();

    this.paymentMethodService
      .create({
        type,
        accountHolder,
        accountNumber,
        bankName: type === 'BANK_ACCOUNT' ? bankName : undefined
      })
      .subscribe({
        next: method => {
          this.toast.success('Payment method added! Verifying in background...');
          this.closeAddModal();
          this.submitting.set(false);
          this.loadMethods();
          this.autoVerifyMethod(method.id);
        },
        error: (err: Error) => {
          this.submitting.set(false);
          this.toast.error(err.message || 'Failed to add payment method');
        }
      });
  }

  private autoVerifyMethod (id: string): void {
    setTimeout(() => {
      this.paymentMethodService.verify(id).subscribe({
        next: () => {
          this.toast.success('Payment method verified and ready for withdrawal!');
          this.loadMethods();
        }
      });
    }, 1500);
  }
}
