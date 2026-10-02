import { Injectable, computed, inject, signal } from '@angular/core';

import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormErrorHelper } from '../../../core/helpers/forms/form-error.helper';
import { PROFILE } from '../../../core/constants/profile/profile.constant';
import { ProfileFormRefDto } from '../interfaces/profile-form-ref.interface';
import { ProfileSaveFailureDto } from '../interfaces/profile-save-failure.interface';
import { ProfileFormService } from './profile-form.service';
import { ProfileFormHelper } from '../helpers/profile-form.helper';

@Injectable()
export class ProfileSaveService {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly formService = inject(ProfileFormService);
  private readonly savingSignal = signal(false);

  readonly isSaving = computed(() => this.savingSignal());

  save ({ form }: ProfileFormRefDto): void {
    FormErrorHelper.clear({ form });

    if (form.invalid || this.savingSignal()) {
      form.markAllAsTouched();
      return;
    }

    const updateData = ProfileFormHelper.handleProfileSave(form);
    if (!updateData) return;

    this.savingSignal.set(true);
    this.userService.updateProfile(updateData).subscribe({
      next: () => {
        this.formService.setInitialValues(updateData);
        this.toast.success(PROFILE.SAVED);
        this.savingSignal.set(false);
      },
      error: (error: Error) => this.report({ form, error })
    });
  }

  private report ({ form, error }: ProfileSaveFailureDto): void {
    const fallback = error instanceof Error && error.message ? error.message : PROFILE.SAVE_FAILED;
    const message = FormErrorHelper.report({ form, error, fallback });
    if (message) this.toast.error(message);
    this.savingSignal.set(false);
  }
}
