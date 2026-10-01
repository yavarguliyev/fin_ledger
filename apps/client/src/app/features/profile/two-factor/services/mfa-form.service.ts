import { Injectable, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { ValidatorsHelper } from '../../../../core/helpers/forms/validators.helper';
import { OTP } from '../../../../core/constants/auth/otp.constant';

@Injectable()
export class MfaFormService {
  private readonly fb = inject(FormBuilder);

  readonly setupCode = this.fb.nonNullable.control('', {
    validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(OTP.LENGTH)]
  });

  readonly challenge = this.fb.nonNullable.group({
    password: this.fb.nonNullable.control('', { validators: [ValidatorsHelper.createRequiredValidator()] }),
    code: this.fb.nonNullable.control('', {
      validators: [ValidatorsHelper.createRequiredValidator(), ValidatorsHelper.createMinLengthValidator(OTP.LENGTH)]
    })
  });

  resetChallenge (): void {
    this.challenge.reset();
  }

  resetSetup (): void {
    this.setupCode.reset();
  }
}
