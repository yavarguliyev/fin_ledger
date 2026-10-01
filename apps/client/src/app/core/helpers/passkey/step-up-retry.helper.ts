import { Observable, catchError, from, switchMap, throwError } from 'rxjs';

import { CaughtErrorDto } from '../../dtos/common/caught-error.dto';
import { HttpRequestError } from '../../errors/http-request.error';
import { PASSKEY } from '../../constants/passkey/passkey.constant';
import { StepUpGuardDto } from '../../dtos/passkey/step-up-guard.dto';

export class StepUpRetryHelper {
  static isStepUpRequired ({ error }: CaughtErrorDto): boolean {
    return error instanceof HttpRequestError && error.status === PASSKEY.STEP_UP_STATUS;
  }

  static guard<T> ({ request, confirm }: StepUpGuardDto<T>): Observable<T> {
    return request.pipe(
      catchError((error: unknown) => {
        if (!StepUpRetryHelper.isStepUpRequired({ error })) return throwError(() => error);
        return from(confirm()).pipe(switchMap(granted => (granted ? request : throwError(() => error))));
      })
    );
  }
}
