import { FormGroup } from '@angular/forms';

import { HttpError } from '../../interfaces/http/http-error.interface';

export interface AccountFailureDto {
  err: HttpError;
  fallback: string;
  form: FormGroup;
}
