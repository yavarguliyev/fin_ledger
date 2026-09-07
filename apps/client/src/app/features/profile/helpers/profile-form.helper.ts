import { FormGroup } from '@angular/forms';

import { ProfileFormService } from '../services/profile-form.service';
import { ProfileFields } from '../../../core/models/auth.model';

export const watchFormChanges = (profileForm: FormGroup, isUser: boolean, formService: ProfileFormService): void => {
  profileForm.valueChanges.subscribe(() => {
    const current = profileForm.getRawValue() as { displayName: string; currency: string };
    if (isUser) formService.checkIfChanged(current.displayName, current.currency);
    else formService.checkIfChanged(current.displayName, 'USD');
  });
};

export const handleProfileSave = (profileForm: FormGroup, isUser: boolean): ProfileFields | null => {
  const formValue = profileForm.getRawValue() as ProfileFields;
  const displayName = formValue.displayName;
  if (!displayName) return null;

  const updateData: ProfileFields = { displayName };
  if (isUser) {
    const currency = formValue.currency;
    if (currency) updateData.currency = currency;
  }

  return updateData;
};
