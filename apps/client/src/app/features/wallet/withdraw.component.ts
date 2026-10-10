import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

import { WalletService } from '../../core/services/wallet.service';
import { PaymentService } from '../../core/services/payment.service';
import { WithdrawMethodsService } from './services/withdraw-methods.service';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';
import { IdempotencyKeyService } from '../../core/services/idempotency-key.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ValidatorsHelper } from '../../core/helpers/forms/validators.helper';
import { CurrencyHelper } from '../../core/helpers/wallet/currency.helper';
import { FormErrorHelper } from '../../core/helpers/forms/form-error.helper';
import { StepUpRetryService } from '../../core/services/step-up-retry.service';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { PAYMENT_FIELD_ALIASES } from '../../core/constants/wallet/payment-fields.constant';
import { PaymentMethodHelper } from '../profile/payment-methods/helpers/payment-method.helper';
import { ConnectivityService } from '../../core/services/connectivity.service';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CommonModule, ReactiveFormsModule, RouterModule, CurrencyFormatPipe, PageHeaderComponent, IconComponent, FieldErrorComponent, ErrorStateComponent],
  providers: [WithdrawMethodsService],
  templateUrl: './templates/withdraw.component.html'
})
export class WithdrawComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly connectivity = inject(ConnectivityService);
  private readonly walletService = inject(WalletService);
  private readonly paymentService = inject(PaymentService);
  readonly methods = inject(WithdrawMethodsService);
  private readonly idempotencyKeys = inject(IdempotencyKeyService);
  private readonly toast = inject(ToastService);
  private readonly stepUp = inject(StepUpRetryService);

  readonly router = inject(Router);
  readonly loading = signal(false);
  readonly states = LOAD_STATE;
  readonly success = signal(false);
  readonly available = computed(() => this.walletService.wallet()?.availableBalanceMinor ?? 0);
  readonly currency = computed(() => this.walletService.wallet()?.currency ?? 'USD');
  readonly isValid = computed(() => this.formStatus() === 'VALID');
  readonly amountMinor = computed(() => CurrencyHelper.toMinor({ amount: this.formValues().amount ?? 0, currency: this.currency() }));

  readonly form = this.fb.group({
    amount: this.fb.control<number | null>(null, {
      validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinValidator(1)]
    }),
    paymentMethodId: this.fb.control<string>('', { validators: [ValidatorsHelper.createRequiredValidator()] }),
    terms: this.fb.control<boolean>(false, { validators: [ValidatorsHelper.createRequiredTrueValidator()] })
  });

  private readonly formValues = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

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
    this.loadWallet();
    this.loadPaymentMethods();
  }

  confirm (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const selectedMethod = this.methods.all().find(m => m.id === this.form.controls.paymentMethodId.value);
    const amountMinor = this.amountMinor();
    const currency = this.currency();
    const paymentMethodId = this.form.controls.paymentMethodId.value ?? undefined;

    this.idempotencyKeys
      .run({
        scope: 'withdraw',
        fingerprint: `${amountMinor}:${currency}:${paymentMethodId}`,
        request: idempotencyKey =>
          this.stepUp.guard({
            request: this.paymentService.withdraw({
              amountMinor,
              currency,
              paymentMethodId,
              idempotencyKey,
              metadata: {
                destination: selectedMethod?.type ?? 'bank_account',
                maskedAccount: selectedMethod ? PaymentMethodHelper.maskedAccount({ method: selectedMethod }) : ''
              }
            })
          })
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          this.toast.success('Withdrawal initiated successfully!');
        },
        error: (err: Error) => {
          this.loading.set(false);
          const message = FormErrorHelper.report({ form: this.form, error: err, fallback: err.message, aliases: PAYMENT_FIELD_ALIASES });
          if (message) this.toast.error(message);
        }
      });
  }

  private loadWallet (): void {
    this.walletService.ensureWallets().subscribe(() => {
      const wallet = this.walletService.wallet();
      if (!wallet) return;
      const maxAmount = CurrencyHelper.fromMinor({ amountMinor: wallet.availableBalanceMinor, currency: wallet.currency });
      this.amountControl.setValidators([
        ValidatorsHelper.createRequiredValidator(),
        ValidatorsHelper.createMinValidator(1),
        ValidatorsHelper.createMaxValidator(maxAmount)
      ]);
      this.amountControl.updateValueAndValidity();
    });
  }

  loadPaymentMethods (): void {
    this.methods.load().subscribe({
      next: methods => {
        const preferred = PaymentMethodHelper.preferredVerified({ methods });
        if (preferred) this.form.controls.paymentMethodId.setValue(preferred.id);
      },
      error: () => undefined
    });
  }
}
