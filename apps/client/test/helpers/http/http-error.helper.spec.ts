import type { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { HttpErrorHelper } from '../../../src/app/core/helpers/http/http-error.helper';
import { ErrorMessageHelper } from '../../../src/app/core/helpers/http/error-message.helper';
import { HttpRequestError } from '../../../src/app/core/errors/http-request.error';

const FALLBACK = 'Something went wrong';

const raise = async (response: HttpErrorResponse): Promise<HttpRequestError> => {
  try {
    await firstValueFrom(HttpErrorHelper.handleHttpError(response));
  } catch (error) {
    return error as HttpRequestError;
  }

  throw new Error('expected the helper to raise');
};

describe('HttpErrorHelper', () => {
  it('keeps the status so callers can tell an unknown outcome from a refusal', async () => {
    const error = await raise({ status: 502, error: { message: 'Bad gateway' } } as HttpErrorResponse);

    expect(error.status).toBe(502);
    expect(error.isOutcomeUnknown).toBe(true);
  });

  it('names the field when the server rejects a value, instead of a bare message', async () => {
    const error = await raise({
      status: 400,
      error: { message: 'Validation failed', errors: [{ path: ['countryCode'], message: 'Country code must be two letters' }] }
    } as HttpErrorResponse);

    expect(error.message).toContain('countryCode');
    expect(error.message).toContain('two letters');
  });

  it('joins several validation issues rather than showing only the first', async () => {
    const error = await raise({
      status: 400,
      error: {
        errors: [
          { path: ['a'], message: 'first' },
          { path: ['b'], message: 'second' }
        ]
      }
    } as HttpErrorResponse);

    expect(error.message).toContain('first');
    expect(error.message).toContain('second');
  });

  it('explains a dropped connection instead of showing an empty message', async () => {
    const error = await raise({ status: 0 } as HttpErrorResponse);

    expect(error.message).toContain('Cannot connect');
  });
});

describe('ErrorMessageHelper', () => {
  it('uses the normalised message a service already produced', () => {
    const error = new HttpRequestError({ message: 'Country code must be two letters', status: 400 });

    expect(ErrorMessageHelper.from({ error, fallback: FALLBACK })).toBe('Country code must be two letters');
  });

  it('falls back when the thrown value carries nothing useful', () => {
    expect(ErrorMessageHelper.from({ error: {}, fallback: FALLBACK })).toBe(FALLBACK);
    expect(ErrorMessageHelper.from({ error: new Error('   '), fallback: FALLBACK })).toBe(FALLBACK);
  });
});
