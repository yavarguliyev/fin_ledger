import { FormControl, FormGroup } from '@angular/forms';

import { FormErrorHelper } from '../../../src/app/core/helpers/forms/form-error.helper';
import { HttpRequestError } from '../../../src/app/core/errors/http-request.error';

const STATUS = 400;
const FALLBACK = 'Could not save';
const EMAIL_MESSAGE = 'Email is already in use';
const AMOUNT_MESSAGE = 'Amount must be positive';
const UNKNOWN_MESSAGE = 'Something else is wrong';

const build = (): FormGroup => new FormGroup({ email: new FormControl(''), amount: new FormControl('') });

const failure = (fieldErrors: Record<string, string>): HttpRequestError => new HttpRequestError({ message: FALLBACK, status: STATUS, fieldErrors });

describe('FormErrorHelper', () => {
  it('puts a server message on the control it names', () => {
    const form = build();

    const unplaced = FormErrorHelper.apply({ form, error: failure({ email: EMAIL_MESSAGE }) });

    expect(unplaced).toEqual([]);
    expect(FormErrorHelper.messageOf({ control: form.get('email') })).toBe(EMAIL_MESSAGE);
    expect(form.get('email')?.touched).toBe(true);
  });

  it('maps a server field name onto a differently named control', () => {
    const form = build();

    FormErrorHelper.apply({ form, error: failure({ amountMinor: AMOUNT_MESSAGE }), aliases: { amountMinor: 'amount' } });

    expect(FormErrorHelper.messageOf({ control: form.get('amount') })).toBe(AMOUNT_MESSAGE);
  });

  it('hands back a message it cannot place, so nothing is swallowed', () => {
    expect(FormErrorHelper.apply({ form: build(), error: failure({ nowhere: UNKNOWN_MESSAGE }) })).toEqual([UNKNOWN_MESSAGE]);
  });

  it('ignores an error that is not an HTTP failure', () => {
    const form = build();

    expect(FormErrorHelper.apply({ form, error: new Error(FALLBACK) })).toEqual([]);
    expect(FormErrorHelper.messageOf({ control: form.get('email') })).toBeNull();
  });

  it('reports the fallback only when no field took the message', () => {
    expect(FormErrorHelper.report({ form: build(), error: failure({ email: EMAIL_MESSAGE }), fallback: FALLBACK })).toBe('');
    expect(FormErrorHelper.report({ form: build(), error: new Error(FALLBACK), fallback: FALLBACK })).toBe(FALLBACK);
    expect(FormErrorHelper.report({ form: build(), error: failure({ nowhere: UNKNOWN_MESSAGE }), fallback: FALLBACK })).toBe(UNKNOWN_MESSAGE);
  });

  it('clears a server message without dropping the control own validators', () => {
    const form = build();
    const control = form.get('email');

    control?.setErrors({ required: true });
    FormErrorHelper.apply({ form, error: failure({ email: EMAIL_MESSAGE }) });
    FormErrorHelper.clear({ form });

    expect(FormErrorHelper.messageOf({ control })).toBeNull();
    expect(control?.hasError('required')).toBe(true);
  });
});
