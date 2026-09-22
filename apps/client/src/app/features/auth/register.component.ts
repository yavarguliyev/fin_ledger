import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PasswordHelper } from '../../core/helpers/forms/password.helper';
import { ValidatorsHelper } from '../../core/helpers/forms/validators.helper';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './templates/register.component.html'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.group(
    {
      displayName: this.fb.control('', {
        validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(3), ValidatorsHelper.createMaxLengthValidator(50)],
        nonNullable: false
      }),
      email: this.fb.control('', { validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createEmailValidator()], nonNullable: false }),
      password: this.fb.control('', {
        validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(8), ValidatorsHelper.createPatternValidator(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)],
        nonNullable: false
      }),
      confirmPassword: this.fb.control('', { validators: [ValidatorsHelper.createRequiredValidator()], nonNullable: false }),
      terms: this.fb.control(false, { validators: [ValidatorsHelper.createRequiredTrueValidator()], nonNullable: false })
    },
    { validators: (control: AbstractControl): ValidationErrors | null => PasswordHelper.matchPassword(control) }
  );

  get displayNameControl (): FormControl<string | null> {
    return this.form.controls.displayName;
  }

  get emailControl (): FormControl<string | null> {
    return this.form.controls.email;
  }

  get passwordControl (): FormControl<string | null> {
    return this.form.controls.password;
  }

  get confirmPasswordControl (): FormControl<string | null> {
    return this.form.controls.confirmPassword;
  }

  get termsControl (): FormControl<boolean | null> {
    return this.form.controls.terms;
  }

  togglePasswordVisibility (): void {
    this.showPassword.update(show => !show);
  }

  toggleConfirmPasswordVisibility (): void {
    this.showConfirmPassword.update(show => !show);
  }

  onSubmit (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const termsAccepted = this.form.controls.terms.value;
    if (!termsAccepted) {
      this.error.set('You must agree to the Terms and Privacy Policy');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.auth
      .register({
        email: this.form.controls.email.value ?? '',
        password: this.form.controls.password.value ?? '',
        displayName: this.form.controls.displayName.value ?? '',
        termsAccepted
      })
      .subscribe({
        next: response => {
          this.loading.set(false);
          this.toast.success(response.message);
          void this.router.navigate(['/auth/login']);
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.error.set(err.message);
        }
      });
  }
}
