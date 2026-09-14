import { ValidatorFn, Validators } from '@angular/forms';

export const createRequiredValidator = (): ValidatorFn => {
  return Validators.required.bind(Validators);
};

export const createEmailValidator = (): ValidatorFn => {
  return Validators.email.bind(Validators);
};

export const createMinLengthValidator = (length: number): ValidatorFn => {
  return Validators.minLength(length);
};

export const createMaxLengthValidator = (length: number): ValidatorFn => {
  return Validators.maxLength(length);
};

export const createPatternValidator = (pattern: string | RegExp): ValidatorFn => {
  return Validators.pattern(pattern);
};

export const createMinValidator = (min: number): ValidatorFn => {
  return Validators.min(min);
};

export const createMaxValidator = (max: number): ValidatorFn => {
  return Validators.max(max);
};

export const createRequiredTrueValidator = (): ValidatorFn => {
  return Validators.requiredTrue.bind(Validators);
};
