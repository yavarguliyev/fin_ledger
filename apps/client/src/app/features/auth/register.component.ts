import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  createRequiredValidator,
  createEmailValidator,
  createMinLengthValidator,
  createMaxLengthValidator,
  createPatternValidator,
  createRequiredTrueValidator
} from '../../core/utils/validators.util';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { matchPassword } from '../../core/utils/password.util';

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
        validators: [createRequiredValidator(), createMinLengthValidator(3), createMaxLengthValidator(50)],
        nonNullable: false
      }),
      email: this.fb.control('', { validators: [createRequiredValidator(), createEmailValidator()], nonNullable: false }),
      password: this.fb.control('', {
        validators: [createRequiredValidator(), createMinLengthValidator(8), createPatternValidator(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)],
        nonNullable: false
      }),
      confirmPassword: this.fb.control('', { validators: [createRequiredValidator()], nonNullable: false }),
      terms: this.fb.control(false, { validators: [createRequiredTrueValidator()], nonNullable: false })
    },
    { validators: matchPassword }
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
        displayName: this.form.controls.displayName.value ?? ''
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Account created successfully! Please contact an administrator to verify your email before logging in.');
          void this.router.navigate(['/auth/login']);
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.error.set(err.message);
        }
      });
  }
}
