import { Observable } from 'rxjs';

import { IdempotencyKeyDto } from './idempotency-key.dto';

export interface RunIdempotentDto<T> extends IdempotencyKeyDto {
  request: (idempotencyKey: string) => Observable<T>;
}
