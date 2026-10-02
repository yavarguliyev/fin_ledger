import { Observable, of, throwError } from 'rxjs';

import { IdempotencyKeyService } from '../../src/app/core/services/idempotency-key.service';
import { HttpRequestError } from '../../src/app/core/errors/http-request.error';
import { IdempotencyScope } from '../../src/app/core/types/http/idempotency-scope.type';

const SCOPE = 'deposit' as IdempotencyScope;
const FINGERPRINT = '2500:USD';
const OTHER_FINGERPRINT = '5000:USD';
const RESULT = 'done';
const UNKNOWN_STATUS = 504;
const REJECTED_STATUS = 400;

const harness = (): { seen: string[]; succeed: (fingerprint?: string) => Observable<string>; fail: (status: number, fingerprint?: string) => Observable<string> } => {
  const service = new IdempotencyKeyService();
  const seen: string[] = [];

  const succeed = (fingerprint: string = FINGERPRINT): Observable<string> =>
    service.run({
      scope: SCOPE,
      fingerprint,
      request: key => {
        seen.push(key);
        return of(RESULT);
      }
    });

  const fail = (status: number, fingerprint: string = FINGERPRINT): Observable<string> =>
    service.run({
      scope: SCOPE,
      fingerprint,
      request: key => {
        seen.push(key);
        return throwError(() => new HttpRequestError({ message: 'nope', status }));
      }
    });

  return { seen, succeed, fail };
};

const settle = async (source: Observable<unknown>): Promise<void> => {
  await new Promise<void>(resolve => source.subscribe({ next: () => resolve(), error: () => resolve() }));
};

describe('IdempotencyKeyService after an outcome', () => {
  let seen: string[];
  let succeed: ReturnType<typeof harness>['succeed'];
  let fail: ReturnType<typeof harness>['fail'];

  beforeEach(() => {
    ({ seen, succeed, fail } = harness());
  });

  it('reuses the key while the outcome is unknown, so a retry cannot double-charge', async () => {
    await settle(fail(UNKNOWN_STATUS));
    await settle(fail(UNKNOWN_STATUS));

    expect(seen).toHaveLength(2);
    expect(seen[0]).toBe(seen[1]);
  });

  it('takes a fresh key after a success', async () => {
    await settle(succeed());
    await settle(succeed());

    expect(seen[0]).not.toBe(seen[1]);
  });

  it('takes a fresh key after a definite rejection, because nothing was charged', async () => {
    await settle(fail(REJECTED_STATUS));
    await settle(fail(REJECTED_STATUS));

    expect(seen[0]).not.toBe(seen[1]);
  });
});

describe('IdempotencyKeyService when the request changes', () => {
  let seen: string[];
  let fail: ReturnType<typeof harness>['fail'];

  beforeEach(() => {
    ({ seen, fail } = harness());
  });

  it('takes a fresh key when the request itself changed', async () => {
    await settle(fail(UNKNOWN_STATUS));
    await settle(fail(UNKNOWN_STATUS, OTHER_FINGERPRINT));

    expect(seen[0]).not.toBe(seen[1]);
  });

  it('keeps the new key stable for the changed request', async () => {
    await settle(fail(UNKNOWN_STATUS, OTHER_FINGERPRINT));
    await settle(fail(UNKNOWN_STATUS, OTHER_FINGERPRINT));

    expect(seen[0]).toBe(seen[1]);
  });
});
