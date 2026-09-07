import { AbstractControl, ValidationErrors } from '@angular/forms';

export const matchPassword = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!password || !confirm) return null;
  return password.value === confirm.value ? null : { mismatch: true };
};
