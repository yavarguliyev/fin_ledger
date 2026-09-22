import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { IdempotencyKeyDto } from '../dtos/idempotency/idempotency-key.dto';
import { RunIdempotentDto } from '../dtos/idempotency/run-idempotent.dto';
import { HttpRequestError } from '../errors/http-request.error';
import { UuidHelper } from '../helpers/common/uuid.helper';
import { IdempotencyKeyEntry } from '../interfaces/http/idempotency-key-entry.interface';
import { IdempotencyScope } from '../types/http/idempotency-scope.type';

@Injectable({ providedIn: 'root' })
export class IdempotencyKeyService {
  private readonly entries = new Map<IdempotencyScope, IdempotencyKeyEntry>();

  run<T> ({ scope, fingerprint, request }: RunIdempotentDto<T>): Observable<T> {
    return request(this.keyFor({ scope, fingerprint })).pipe(
      tap({
        next: () => this.entries.delete(scope),
        error: (error: unknown) => {
          if (!(error instanceof HttpRequestError) || !error.isOutcomeUnknown) this.entries.delete(scope);
        }
      })
    );
  }

  private keyFor ({ scope, fingerprint }: IdempotencyKeyDto): string {
    const entry = this.entries.get(scope);
    if (entry?.fingerprint === fingerprint) return entry.key;

    const key = UuidHelper.generate();
    this.entries.set(scope, { fingerprint, key });

    return key;
  }
}
