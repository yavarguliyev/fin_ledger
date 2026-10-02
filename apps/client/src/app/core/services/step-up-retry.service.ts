import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PASSKEY_MESSAGES } from '../constants/passkey/passkey-messages.constant';
import { PasskeyCeremonyService } from './passkey-ceremony.service';
import { RequestRefDto } from '../interfaces/common/request-ref.interface';
import { StepUpRetryHelper } from '../helpers/passkey/step-up-retry.helper';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class StepUpRetryService {
  private readonly ceremony = inject(PasskeyCeremonyService);
  private readonly toast = inject(ToastService);

  guard<T> ({ request }: RequestRefDto<T>): Observable<T> {
    return StepUpRetryHelper.guard({ request, confirm: () => this.confirm() });
  }

  private async confirm (): Promise<boolean> {
    this.toast.info(PASSKEY_MESSAGES.STEP_UP_PROMPT);
    const outcome = await this.ceremony.stepUp();

    if (outcome === 'completed') return true;
    if (outcome !== 'cancelled') this.toast.error(PASSKEY_MESSAGES.STEP_UP_FAILED);

    return false;
  }
}
