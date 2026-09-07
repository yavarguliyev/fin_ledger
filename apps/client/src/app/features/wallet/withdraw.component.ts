import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PaymentMethod } from '../../core/models/payment-method.model';
import { uuid } from '../../core/utils/uuid.util';
import { createRequiredValidator, createMinValidator, createMaxValidator, createRequiredTrueValidator } from '../../core/utils/validators.util';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CurrencyFormatPipe, PageHeaderComponent],
  templateUrl: './templates/withdraw.component.html'
})
export class WithdrawComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly walletService = inject(WalletService);
  private readonly paymentService = inject(PaymentService);
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly toast = inject(ToastService);

  readonly router = inject(Router);
  readonly loading = signal(false);
  readonly loadingMethods = signal(true);
  readonly success = signal(false);
  readonly availableBalance = signal(0);
  readonly walletId = signal('');
  readonly paymentMethods = signal<PaymentMethod[]>([]);
  readonly verifiedMethods = computed(() => this.paymentMethods().filter(m => m.status === 'VERIFIED'));
  readonly available = computed(() => this.availableBalance());
  readonly currency = computed(() => this.walletService.wallet()?.currency ?? 'USD');

  readonly form = this.fb.group({
    amount: this.fb.control<number | null>(null, { validators: [createRequiredValidator(), createMinValidator(1)] }),
    paymentMethodId: this.fb.control<string>('', { validators: [createRequiredValidator()] }),
    terms: this.fb.control<boolean>(false, { validators: [createRequiredTrueValidator()] })
  });

  private readonly formValues = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  readonly isValid = computed(() => this.formStatus() === 'VALID');
  readonly amountMinor = computed(() => Math.round((this.formValues().amount ?? 0) * 100));

  get amountControl (): typeof this.form.controls.amount {
    return this.form.controls.amount;
  }

  get paymentMethodControl (): typeof this.form.controls.paymentMethodId {
    return this.form.controls.paymentMethodId;
  }

  selectMethod (id: string): void {
    this.form.controls.paymentMethodId.setValue(id);
    this.form.controls.paymentMethodId.markAsTouched();
  }

  ngOnInit (): void {
    const user = this.auth.currentUser();
    const walletId = user?.walletId;

    if (walletId) {
      this.walletId.set(walletId);
      this.loadWallet(walletId);
    }

    this.loadPaymentMethods();
  }

  confirm (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const selectedMethod = this.paymentMethods().find(m => m.id === this.form.controls.paymentMethodId.value);

    this.paymentService
      .withdraw(this.walletId(), {
        amountMinor: this.amountMinor(),
        currency: this.currency(),
        paymentMethodId: this.form.controls.paymentMethodId.value ?? undefined,
        idempotencyKey: uuid(),
        metadata: { destination: selectedMethod?.type ?? 'bank_account', maskedAccount: selectedMethod?.maskedAccount ?? '' }
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          this.toast.success('Withdrawal initiated successfully!');
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.toast.error(err.message);
        }
      });
  }

  private loadWallet (walletId: string): void {
    this.walletService.getWallet(walletId).subscribe(() => {
      const wallet = this.walletService.wallet();
      if (!wallet) return;

      this.availableBalance.set(wallet.availableBalanceMinor);
      this.amountControl.setValidators([createRequiredValidator(), createMinValidator(1), createMaxValidator(wallet.availableBalanceMinor / 100)]);
      this.amountControl.updateValueAndValidity();
    });
  }

  private loadPaymentMethods (): void {
    this.paymentMethodService.list().subscribe({
      next: methods => {
        this.paymentMethods.set(methods);
        this.loadingMethods.set(false);
        const verified = methods.filter(m => m.status === 'VERIFIED');

        if (verified.length > 0) {
          const defaultMethod = verified.find(m => m.isDefault) ?? verified[0];
          if (defaultMethod) this.form.controls.paymentMethodId.setValue(defaultMethod.id);
        }
      },
      error: () => this.loadingMethods.set(false)
    });
  }
}
