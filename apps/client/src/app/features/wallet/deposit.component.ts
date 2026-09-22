import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { WalletService } from '../../core/services/wallet.service';
import { PaymentService } from '../../core/services/payment.service';
import { ToastService } from '../../core/services/toast.service';
import { DepositFormService } from './services/deposit-form.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ValidatorsHelper } from '../../core/helpers/forms/validators.helper';
import { CurrencyHelper } from '../../core/helpers/wallet/currency.helper';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CurrencyFormatPipe, PageHeaderComponent],
  providers: [DepositFormService],
  templateUrl: './templates/deposit.component.html'
})
export class DepositComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly walletService = inject(WalletService);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(ToastService);

  readonly router = inject(Router);
  readonly formService = inject(DepositFormService);

  readonly loading = signal(false);
  readonly success = signal(false);

  readonly termsControl = this.fb.nonNullable.control(false);
  readonly amountMinor = computed(() => CurrencyHelper.toMinor(this.amountControl.value, this.currency()));
  readonly currency = computed(() => this.walletService.wallet()?.currency ?? 'USD');

  readonly amountControl = this.fb.nonNullable.control(0, {
    validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinValidator(1), ValidatorsHelper.createMaxValidator(10000)]
  });

  setAmount (minor: number): void {
    this.amountControl.setValue(CurrencyHelper.fromMinor(minor, this.currency()));
  }

  ngOnInit (): void {
    this.walletService.loadWallets().subscribe();
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

    const payload = this.formService.buildPayload(this.amountMinor(), this.currency());

    this.paymentService.deposit(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.toast.success('Deposit completed successfully!');
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.toast.error(err.message);
      }
    });
  }
}
