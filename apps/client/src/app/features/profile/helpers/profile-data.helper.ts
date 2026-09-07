import { WritableSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ProfileFormService } from '../services/profile-form.service';

export const loadWalletData = (
  walletId: string | null | undefined,
  displayName: string,
  formService: ProfileFormService,
  currency: WritableSignal<string>,
  createdAt: WritableSignal<string>,
  profileForm: FormGroup
): void => {
  formService.loadWallet(
    walletId,
    (curr, created) =>
      formService.updateWalletInfo(
        curr,
        created,
        displayName,
        (c: string) => currency.set(c),
        (ca: string) => createdAt.set(ca),
        (c: string) => {
          const control = profileForm.get('currency');
          if (control) control.setValue(c);
        }
      ),
    () => formService.setInitialValue(displayName, (profileForm.getRawValue() as { currency: string }).currency ?? 'USD')
  );
};

export const handleProfileUpdateSuccess = (
  displayName: string,
  currency: string,
  isUser: boolean,
  walletId: string | null,
  formService: ProfileFormService,
  currencySignal: WritableSignal<string>,
  profileForm: FormGroup
): void => {
  formService.handleProfileUpdateSuccess(
    displayName,
    currency,
    isUser,
    walletId,
    (c: string) => currencySignal.set(c),
    (c: string) => {
      const control = profileForm.get('currency');
      if (control) control.setValue(c);
    }
  );
};
