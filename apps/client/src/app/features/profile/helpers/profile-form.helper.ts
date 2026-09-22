import { FormGroup } from '@angular/forms';

import { ProfileFormService } from '../services/profile-form.service';
import { ProfileFields } from '../../../core/types/auth/profile-fields.type';

export class ProfileFormHelper {
  static watchFormChanges (profileForm: FormGroup, formService: ProfileFormService): void {
    profileForm.valueChanges.subscribe(() => {
      const { displayName } = profileForm.getRawValue() as ProfileFields;
      formService.checkIfChanged(displayName);
    });
  }

  static handleProfileSave (profileForm: FormGroup): ProfileFields | null {
    const { displayName } = profileForm.getRawValue() as ProfileFields;

    return displayName ? { displayName } : null;
  }
}
