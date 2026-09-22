import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MfaService } from '../../../core/services/mfa.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MfaHelper } from '../../../core/helpers/auth/mfa.helper';
import { ValidatorsHelper } from '../../../core/helpers/forms/validators.helper';
import { MfaStatus } from '../../../core/interfaces/auth/mfa-status.interface';
import { MfaEnrollment } from '../../../core/interfaces/auth/mfa-enrollment.interface';
import { RunRequestDto } from '../dtos/run-request.dto';

@Component({
  selector: 'app-two-factor-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './templates/two-factor-settings.component.html'
})
export class TwoFactorSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mfa = inject(MfaService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly status = signal<MfaStatus | null>(null);
  readonly enrollment = signal<MfaEnrollment | null>(null);
  readonly recoveryCodes = signal<string[] | null>(null);
  readonly disableOpen = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly setupOpen = computed(() => this.enrollment() !== null || this.recoveryCodes() !== null);
  readonly manualKey = computed(() => {
    const uri = this.enrollment()?.otpauthUri;
    return uri ? (new URL(uri).searchParams.get('secret') ?? '') : '';
  });

  readonly setupCode = this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(6)] });
  readonly disableForm = this.fb.nonNullable.group({
    password: this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator()] }),
    code: this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(6)] })
  });

  ngOnInit (): void {
    this.loadStatus();
  }

  startSetup (): void {
    this.run({ request: this.mfa.setup(), onSuccess: enrollment => this.enrollment.set(enrollment) });
  }

  confirmSetup (): void {
    if (this.setupCode.invalid) {
      this.setupCode.markAsTouched();
      return;
    }

    this.run({
      request: this.mfa.enable({ code: this.setupCode.value }),
      onSuccess: ({ recoveryCodes }) => {
        this.enrollment.set(null);
        this.recoveryCodes.set(recoveryCodes);
        this.loadStatus();
      }
    });
  }

  copyRecoveryCodes (): void {
    void navigator.clipboard.writeText((this.recoveryCodes() ?? []).join('\n')).then(() => this.toast.success('Recovery codes copied'));
  }

  downloadRecoveryCodes (): void {
    MfaHelper.downloadRecoveryCodes({ codes: this.recoveryCodes() ?? [], accountName: this.auth.currentUser()?.email ?? '' });
  }

  closeSetup (): void {
    this.enrollment.set(null);
    this.recoveryCodes.set(null);
    this.setupCode.reset();
    this.error.set(null);
  }

  openDisable (): void {
    this.disableOpen.set(true);
  }

  closeDisable (): void {
    this.disableOpen.set(false);
    this.disableForm.reset();
    this.error.set(null);
  }

  confirmDisable (): void {
    if (this.disableForm.invalid) {
      this.disableForm.markAllAsTouched();
      return;
    }

    this.run({
      request: this.mfa.disable(this.disableForm.getRawValue()),
      onSuccess: () => {
        this.toast.success('Two-factor authentication turned off');
        this.closeDisable();
        this.loadStatus();
      }
    });
  }

  private loadStatus (): void {
    this.mfa.getStatus().subscribe({ next: status => this.status.set(status) });
  }

  private run<T> ({ request, onSuccess }: RunRequestDto<T>): void {
    this.loading.set(true);
    this.error.set(null);
    request.subscribe({
      next: value => {
        this.loading.set(false);
        onSuccess(value);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
      }
    });
  }
}
