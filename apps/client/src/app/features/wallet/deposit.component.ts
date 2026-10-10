import { Component, ChangeDetectionStrategy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

import { WalletService } from '../../core/services/wallet.service';
import { PaymentService } from '../../core/services/payment.service';
import { IdempotencyKeyService } from '../../core/services/idempotency-key.service';
import { ToastService } from '../../core/services/toast.service';
import { DEPOSIT_MESSAGES } from '../../core/constants/wallet/deposit-messages.constant';
import { DepositFormService } from './services/deposit-form.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ValidatorsHelper } from '../../core/helpers/forms/validators.helper';
import { CurrencyHelper } from '../../core/helpers/wallet/currency.helper';
import { ErrorMessageHelper } from '../../core/helpers/http/error-message.helper';
import { ReceiptService } from '../../core/services/receipt.service';
import { ReceiptViewerStore } from '../../core/services/receipt-viewer.store';
import { RECEIPT } from '../../core/constants/payment/receipt.constant';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../core/constants/ui/load-state.constant';

@Component({
  selector: 'app-deposit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CommonModule, ReactiveFormsModule, RouterModule, CurrencyFormatPipe, PageHeaderComponent, IconComponent, ErrorStateComponent],
  providers: [DepositFormService],
  templateUrl: './templates/deposit.component.html'
})
export class DepositComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly connectivity = inject(ConnectivityService);
  readonly states = LOAD_STATE;
  private readonly walletService = inject(WalletService);
  private readonly paymentService = inject(PaymentService);
  private readonly idempotencyKeys = inject(IdempotencyKeyService);
  private readonly toast = inject(ToastService);
  private readonly receipts = inject(ReceiptService);
  private readonly viewer = inject(ReceiptViewerStore);

  readonly router = inject(Router);
  readonly formService = inject(DepositFormService);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly completedPaymentId = signal<string | null>(null);
  readonly receiptText = RECEIPT;

  readonly termsControl = this.fb.nonNullable.control(false);

  readonly currency = computed(() => this.walletService.wallet()?.currency ?? 'USD');
  readonly amountMinor = computed(() => CurrencyHelper.toMinor({ amount: this.amountValue(), currency: this.currency() }));

  readonly amountControl = this.fb.nonNullable.control(0, {
    validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinValidator(1), ValidatorsHelper.createMaxValidator(10000)]
  });

  private readonly amountValue = toSignal(this.amountControl.valueChanges, { initialValue: this.amountControl.value });

  setAmount (minor: number): void {
    this.amountControl.setValue(CurrencyHelper.fromMinor({ amountMinor: minor, currency: this.currency() }));
  }

  ngOnInit (): void {
    this.walletService.ensureWallets().subscribe();
    this.formService.loadPaymentMethods();
  }

  next (): void {
    if (this.formService.step() === 1) {
      this.amountControl.markAsTouched();
      if (this.amountControl.invalid) return;
    }

    if (this.formService.step() === 2) {
      const hasMethod = !!this.formService.selectedMethodId();
      if (!hasMethod || !this.termsControl.value) return;
    }

    this.formService.step.update(s => s + 1);
  }

  confirm (): void {
    this.loading.set(true);

    const amountMinor = this.amountMinor();
    const currency = this.currency();

    this.idempotencyKeys
      .run({
        scope: 'deposit',
        fingerprint: `${amountMinor}:${currency}:${this.formService.selectedMethodId()}`,
        request: idempotencyKey => this.paymentService.deposit(this.formService.buildPayload({ amountMinor, currency, idempotencyKey }))
      })
      .subscribe({
        next: payment => {
          this.loading.set(false);

          if (payment.status !== 'COMPLETED') {
            this.toast.info(payment.status === 'REQUIRES_ACTION' ? DEPOSIT_MESSAGES.REQUIRES_ACTION : DEPOSIT_MESSAGES.OPEN);
            return;
          }

          this.completedPaymentId.set(payment.id);
          this.success.set(true);
          this.toast.success(DEPOSIT_MESSAGES.COMPLETED);
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.toast.error(ErrorMessageHelper.from({ error: err, fallback: DEPOSIT_MESSAGES.FAILED }));
        }
      });
  }

  viewReceipt (): void {
    const paymentId = this.completedPaymentId();
    if (paymentId) this.viewer.open({ paymentId });
  }

  downloadReceipt (): void {
    const paymentId = this.completedPaymentId();
    if (!paymentId) return;
    this.receipts.download({ paymentId }).subscribe({ error: () => this.toast.error(RECEIPT.FAILED) });
  }
}
