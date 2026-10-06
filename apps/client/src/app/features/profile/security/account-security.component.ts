import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';

import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ValidatorsHelper } from '../../../core/helpers/forms/validators.helper';
import { ErrorMessageHelper } from '../../../core/helpers/http/error-message.helper';
import { FormErrorHelper } from '../../../core/helpers/forms/form-error.helper';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { ACCOUNT } from '../../../core/constants/account/account.constant';
import { HttpError } from '../../../core/interfaces/http/http-error.interface';
import { AccountFailureDto } from '../../../core/interfaces/account/account-failure.interface';
import { PasswordToggleComponent } from '../../../shared/components/password-toggle/password-toggle.component';

@Component({
  selector: 'app-account-security',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CommonModule, ReactiveFormsModule, ModalComponent, FieldErrorComponent, PasswordToggleComponent],
  templateUrl: './templates/account-security.component.html'
})
export class AccountSecurityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly account = inject(AccountService);
  private readonly toast = inject(ToastService);

  readonly passwordOpen = signal(false);
  readonly emailOpen = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly pendingNotice = signal<string | null>(null);

  readonly passwordDisabled = computed(() => this.saving());
  readonly emailDisabled = computed(() => this.saving());

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator()] }),
    newPassword: this.fb.nonNullable.control('', {
      validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(ACCOUNT.MIN_PASSWORD_LENGTH)]
    })
  });

  readonly emailForm = this.fb.nonNullable.group({
    newEmail: this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createEmailValidator()] }),
    currentPassword: this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator()] })
  });

  openPassword (): void {
    this.reset();
    this.passwordForm.reset();
    this.passwordOpen.set(true);
  }

  openEmail (): void {
    this.reset();
    this.emailForm.reset();
    this.emailOpen.set(true);
  }

  closePassword (): void {
    this.passwordOpen.set(false);
    this.reset();
  }

  closeEmail (): void {
    this.emailOpen.set(false);
    this.reset();
  }

  submitPassword (): void {
    FormErrorHelper.clear({ form: this.passwordForm });
    if (this.passwordForm.invalid || this.saving()) return this.passwordForm.markAllAsTouched();

    this.saving.set(true);
    this.error.set(null);

    this.account.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.passwordOpen.set(false);
        this.toast.success(ACCOUNT.PASSWORD_CHANGED_MESSAGE);
      },
      error: (err: HttpError) => this.fail({ err, fallback: ACCOUNT.PASSWORD_CHANGE_FALLBACK, form: this.passwordForm })
    });
  }

  submitEmail (): void {
    FormErrorHelper.clear({ form: this.emailForm });
    if (this.emailForm.invalid || this.saving()) return this.emailForm.markAllAsTouched();

    this.saving.set(true);
    this.error.set(null);

    this.account.changeEmail(this.emailForm.getRawValue()).subscribe({
      next: response => {
        this.saving.set(false);
        this.emailOpen.set(false);
        this.pendingNotice.set(response.message);
        this.toast.success(response.message);
      },
      error: (err: HttpError) => this.fail({ err, fallback: ACCOUNT.EMAIL_CHANGE_FALLBACK, form: this.emailForm })
    });
  }

  private fail ({ err, fallback, form }: AccountFailureDto): void {
    this.saving.set(false);
    const message = ErrorMessageHelper.from({ error: err, fallback });
    this.error.set(FormErrorHelper.report({ form, error: err, fallback: message }) || null);
  }

  private reset (): void {
    this.error.set(null);
    this.saving.set(false);
  }
}
