import { DestroyRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ProfileFormService } from '../services/profile-form.service';

export interface WatchFormChangesDto {
  profileForm: FormGroup;
  formService: ProfileFormService;
  destroyRef: DestroyRef;
}
