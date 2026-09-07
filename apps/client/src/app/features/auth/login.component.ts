import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { createRequiredValidator, createEmailValidator, createMinLengthValidator } from '../../core/utils/validators.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './templates/login.component.html'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    email: this.fb.control('', { validators: [createRequiredValidator(), createEmailValidator()], nonNullable: false }),
    password: this.fb.control('', { validators: [createRequiredValidator(), createMinLengthValidator(6)], nonNullable: false }),
    remember: this.fb.control(false, { nonNullable: false })
  });

  get emailControl (): FormControl<string | null> {
    return this.form.controls.email;
  }

  get passwordControl (): FormControl<string | null> {
    return this.form.controls.password;
  }

  togglePasswordVisibility (): void {
    this.showPassword.update(show => !show);
  }

  ngOnInit (): void {
    const rememberedEmail = this.auth.getRememberedEmail();
    if (rememberedEmail) {
      this.form.controls.email.setValue(rememberedEmail);
      this.form.controls.remember.setValue(true);
    }
  }

  onSubmit (): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value ?? '';
    const password = this.form.controls.password.value ?? '';
    const rememberMe = this.form.controls.remember.value ?? false;

    this.loading.set(true);
    this.error.set(null);
    this.auth.login(email, password, rememberMe).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Welcome back!');
        void this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
      }
    });
  }
}
