import { Component, ChangeDetectionStrategy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MfaService } from '../../../core/services/mfa.service';
import { StepUpRetryService } from '../../../core/services/step-up-retry.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MfaHelper } from '../../../core/helpers/auth/mfa.helper';
import { MfaEnrollment } from '../../../core/interfaces/auth/mfa-enrollment.interface';
import { RunRequestDto } from '../interfaces/run-request.interface';
import { MFA_MESSAGES } from '../../../core/constants/auth/mfa-messages.constant';
import { MfaFormService } from './services/mfa-form.service';
import { MfaStatusService } from './services/mfa-status.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { LOAD_STATE } from '../../../core/constants/ui/load-state.constant';
import { PasswordToggleComponent } from '../../../shared/components/password-toggle/password-toggle.component';

@Component({
  selector: 'app-two-factor-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, OtpInputComponent, PasswordToggleComponent, SkeletonComponent, ErrorStateComponent],
  providers: [MfaFormService, MfaStatusService],
  templateUrl: './templates/two-factor-settings.component.html'
})
export class TwoFactorSettingsComponent implements OnInit {
  readonly forms = inject(MfaFormService);
  readonly statusStore = inject(MfaStatusService);
  private readonly mfa = inject(MfaService);
  private readonly stepUp = inject(StepUpRetryService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly states = LOAD_STATE;
  readonly enrollment = signal<MfaEnrollment | null>(null);
  readonly recoveryCodes = signal<string[] | null>(null);
  readonly disableOpen = signal(false);
  readonly regenerateOpen = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly setupOpen = computed(() => this.enrollment() !== null || this.recoveryCodes() !== null);
  readonly manualKey = computed(() => {
    const uri = this.enrollment()?.otpauthUri;
    return uri ? (new URL(uri).searchParams.get('secret') ?? '') : '';
  });

  ngOnInit (): void {
    this.statusStore.refresh();
  }

  startSetup (): void {
    this.run({ request: this.mfa.setup(), onSuccess: enrollment => this.enrollment.set(enrollment) });
  }

  copyRecoveryCodes (): void {
    void MfaHelper.copyRecoveryCodes({ codes: this.recoveryCodes() ?? [] }).then(() => this.toast.success(MFA_MESSAGES.COPIED));
  }

  downloadRecoveryCodes (): void {
    MfaHelper.downloadRecoveryCodes({ codes: this.recoveryCodes() ?? [], accountName: this.auth.currentUser()?.email ?? '' });
  }

  closeDisable (): void {
    this.disableOpen.set(false);
    this.resetChallenge();
  }

  closeRegenerate (): void {
    this.regenerateOpen.set(false);
    this.resetChallenge();
  }

  confirmSetup (): void {
    if (this.forms.setupCode.invalid) return this.forms.setupCode.markAsTouched();

    this.run({
      request: this.mfa.enable({ code: this.forms.setupCode.value }),
      onSuccess: ({ recoveryCodes }) => {
        this.enrollment.set(null);
        this.recoveryCodes.set(recoveryCodes);
        this.statusStore.refresh();
      }
    });
  }

  closeSetup (): void {
    this.enrollment.set(null);
    this.recoveryCodes.set(null);
    this.forms.resetSetup();
    this.error.set(null);
  }

  confirmRegenerate (): void {
    if (this.forms.challenge.invalid) return this.forms.challenge.markAllAsTouched();

    this.run({
      request: this.mfa.regenerateRecoveryCodes(this.forms.challenge.getRawValue()),
      onSuccess: ({ recoveryCodes }) => {
        this.closeRegenerate();
        this.recoveryCodes.set(recoveryCodes);
        this.toast.success(MFA_MESSAGES.REGENERATED);
      }
    });
  }

  confirmDisable (): void {
    if (this.forms.challenge.invalid) return this.forms.challenge.markAllAsTouched();

    this.run({
      request: this.stepUp.guard({ request: this.mfa.disable(this.forms.challenge.getRawValue()) }),
      onSuccess: () => {
        this.toast.success(MFA_MESSAGES.TURNED_OFF);
        this.closeDisable();
        this.statusStore.refresh();
      }
    });
  }

  private resetChallenge (): void {
    this.forms.resetChallenge();
    this.error.set(null);
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
