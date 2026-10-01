import { FormGroup } from '@angular/forms';

export interface ApplyFormErrorsDto {
  form: FormGroup;
  error?: unknown;
  aliases?: Readonly<Record<string, string>>;
}
