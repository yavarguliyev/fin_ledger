import { FormGroup } from '@angular/forms';

import { HttpError } from '../http/http-error.interface';

export interface AccountFailureDto {
  err: HttpError;
  fallback: string;
  form: FormGroup;
}
