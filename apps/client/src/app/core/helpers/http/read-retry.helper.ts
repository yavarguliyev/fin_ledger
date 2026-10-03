import { HttpErrorResponse } from '@angular/common/http';

import { READ_RETRY } from '../../constants/http/read-retry.constant';
import { RetryAttemptDto } from '../../interfaces/http/retry-attempt.interface';

export class ReadRetryHelper {
  static delayFor ({ error, attempt }: RetryAttemptDto): number | null {
    const retryable = error instanceof HttpErrorResponse && (READ_RETRY.RETRYABLE_STATUSES as readonly number[]).includes(error.status);
    return retryable ? READ_RETRY.BASE_DELAY_MS * READ_RETRY.BACKOFF ** (attempt - 1) : null;
  }
}
