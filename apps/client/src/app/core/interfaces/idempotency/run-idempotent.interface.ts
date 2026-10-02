import { Observable } from 'rxjs';

import { IdempotencyKeyDto } from './idempotency-key.interface';

export interface RunIdempotentDto<T> extends IdempotencyKeyDto {
  request: (idempotencyKey: string) => Observable<T>;
}
