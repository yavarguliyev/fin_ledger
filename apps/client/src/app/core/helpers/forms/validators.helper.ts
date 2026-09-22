import { ValidatorFn, Validators } from '@angular/forms';

export class ValidatorsHelper {
  static createRequiredValidator (): ValidatorFn {
    return Validators.required.bind(Validators);
  }

  static createEmailValidator (): ValidatorFn {
    return Validators.email.bind(Validators);
  }

  static createMinLengthValidator (length: number): ValidatorFn {
    return Validators.minLength(length);
  }

  static createMaxLengthValidator (length: number): ValidatorFn {
    return Validators.maxLength(length);
  }

  static createPatternValidator (pattern: string | RegExp): ValidatorFn {
    return Validators.pattern(pattern);
  }

  static createMinValidator (min: number): ValidatorFn {
    return Validators.min(min);
  }

  static createMaxValidator (max: number): ValidatorFn {
    return Validators.max(max);
  }

  static createRequiredTrueValidator (): ValidatorFn {
    return Validators.requiredTrue.bind(Validators);
  }
}
