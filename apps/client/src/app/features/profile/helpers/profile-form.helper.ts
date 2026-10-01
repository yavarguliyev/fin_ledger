import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';

import { ProfileFields } from '../../../core/types/auth/profile-fields.type';
import { WatchFormChangesDto } from '../dtos/watch-form-changes.dto';

export class ProfileFormHelper {
  static watchFormChanges ({ profileForm, formService, destroyRef }: WatchFormChangesDto): void {
    profileForm.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => formService.checkIfChanged(profileForm.getRawValue() as ProfileFields));
  }

  static handleProfileSave (profileForm: FormGroup): ProfileFields | null {
    const { displayName, countryCode, dateOfBirth } = profileForm.getRawValue() as ProfileFields;
    if (!displayName) return null;

    return {
      displayName,
      ...(countryCode && { countryCode: countryCode.toUpperCase() }),
      ...(dateOfBirth && { dateOfBirth })
    };
  }
}
