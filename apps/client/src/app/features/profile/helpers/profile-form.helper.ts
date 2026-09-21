import { FormGroup } from '@angular/forms';

import { ProfileFormService } from '../services/profile-form.service';
import { ProfileFields } from '../../../core/models/auth.model';

export const watchFormChanges = (profileForm: FormGroup, formService: ProfileFormService): void => {
  profileForm.valueChanges.subscribe(() => {
    const { displayName } = profileForm.getRawValue() as ProfileFields;
    formService.checkIfChanged(displayName);
  });
};

export const handleProfileSave = (profileForm: FormGroup): ProfileFields | null => {
  const { displayName } = profileForm.getRawValue() as ProfileFields;

  return displayName ? { displayName } : null;
};
