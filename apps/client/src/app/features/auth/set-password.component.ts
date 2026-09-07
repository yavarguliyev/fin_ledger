import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { createRequiredValidator, createMinLengthValidator } from '../../core/utils/validators.util';
import { HttpError } from '../../core/models/base.mode';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './templates/set-password.component.html'
})
export class SetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly token = signal<string | null>(null);

  readonly form = this.fb.group({
    password: this.fb.control('', { validators: [createRequiredValidator(), createMinLengthValidator(6)], nonNullable: false }),
    confirmPassword: this.fb.control('', { validators: [createRequiredValidator(), createMinLengthValidator(6)], nonNullable: false })
  });

  get passwordControl (): FormControl<string | null> {
    return this.form.controls.password;
  }

  get confirmPasswordControl (): FormControl<string | null> {
    return this.form.controls.confirmPassword;
  }

  togglePasswordVisibility (): void {
    this.showPassword.update(show => !show);
  }

  toggleConfirmPasswordVisibility (): void {
    this.showConfirmPassword.update(show => !show);
  }

  ngOnInit (): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.error.set('Invalid setup link');
      return;
    }

    this.token.set(token);
  }

  onSubmit (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const password = this.form.controls.password.value ?? '';
    const confirmPassword = this.form.controls.confirmPassword.value ?? '';

    if (password !== confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    const token = this.token();
    if (!token) {
      this.error.set('Invalid setup link');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.auth.verifyEmail(token, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.toast.success('Password set successfully! Logging you in...');
        void this.router.navigate(['/dashboard']);
      },
      error: (err: HttpError) => {
        this.loading.set(false);
        const errorMessage = err?.error?.message ?? err?.message ?? 'Failed to set password';
        this.error.set(errorMessage);
      }
    });
  }
}
