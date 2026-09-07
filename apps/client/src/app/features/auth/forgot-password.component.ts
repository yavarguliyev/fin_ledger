import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { createRequiredValidator, createEmailValidator } from '../../core/utils/validators.util';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './templates/forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    email: this.fb.control('', { validators: [createRequiredValidator(), createEmailValidator()], nonNullable: false })
  });

  get emailControl (): FormControl<string | null> {
    return this.form.controls.email;
  }

  backToLogin (): void {
    void this.router.navigate(['/auth/login']);
  }

  onSubmit (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value ?? '';

    this.loading.set(true);
    this.error.set(null);
    this.auth.requestPasswordReset(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.toast.success('Password reset link sent to your email!');
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
      }
    });
  }
}
