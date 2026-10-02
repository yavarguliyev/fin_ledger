import { Observable, defer, firstValueFrom, of, throwError } from 'rxjs';

import { HttpRequestError } from '../../../src/app/core/errors/http-request.error';
import { StepUpRetryHelper } from '../../../src/app/core/helpers/passkey/step-up-retry.helper';
import { STEP_UP_SPEC } from '../../constants/step-up.constant';

const failingOnce = (error: unknown): { request: Observable<string>; attempts: () => number } => {
  let calls = 0;

  return {
    request: defer(() => {
      calls += 1;

      return calls === 1 ? throwError(() => error) : of(STEP_UP_SPEC.VALUE);
    }),
    attempts: () => calls
  };
};

const stepUpError = (): HttpRequestError => new HttpRequestError({ message: STEP_UP_SPEC.STEP_UP_MESSAGE, status: STEP_UP_SPEC.FORBIDDEN });

const granted = (): Promise<boolean> => Promise.resolve(true);
const refused = (): Promise<boolean> => Promise.resolve(false);

describe('StepUpRetryHelper.guard', () => {
  it('passes a successful request through without asking for a passkey', async () => {
    let asked = false;

    const value = await firstValueFrom(
      StepUpRetryHelper.guard({
        request: of(STEP_UP_SPEC.VALUE),
        confirm: () => {
          asked = true;

          return granted();
        }
      })
    );

    expect(value).toBe(STEP_UP_SPEC.VALUE);
    expect(asked).toBe(false);
  });

  it('confirms and sends the request exactly once more', async () => {
    const { request, attempts } = failingOnce(stepUpError());

    await expect(firstValueFrom(StepUpRetryHelper.guard({ request, confirm: granted }))).resolves.toBe(STEP_UP_SPEC.VALUE);
    expect(attempts()).toBe(2);
  });
});

describe('StepUpRetryHelper.guard refusals', () => {
  it('never re-sends a request that failed for another reason', async () => {
    const error = new HttpRequestError({ message: STEP_UP_SPEC.OTHER_MESSAGE, status: STEP_UP_SPEC.SERVER_ERROR });
    const { request, attempts } = failingOnce(error);
    let asked = false;

    await expect(
      firstValueFrom(
        StepUpRetryHelper.guard({
          request,
          confirm: () => {
            asked = true;

            return granted();
          }
        })
      )
    ).rejects.toBe(error);
    expect(attempts()).toBe(1);
    expect(asked).toBe(false);
  });

  it('gives up with the original error when the ceremony is refused', async () => {
    const error = stepUpError();
    const { request, attempts } = failingOnce(error);

    await expect(firstValueFrom(StepUpRetryHelper.guard({ request, confirm: refused }))).rejects.toBe(error);
    expect(attempts()).toBe(1);
  });
});
