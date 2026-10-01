import { PasskeyHelper } from '../../../src/app/core/helpers/passkey/passkey.helper';
import { PASSKEY_SPEC } from '../../constants/passkey.constant';

const named = (name: string): Error => {
  const error = new Error(name);
  error.name = name;

  return error;
};

const withAgent = (userAgent: string): void => {
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent }, configurable: true });
};

describe('PasskeyHelper', () => {
  it('treats a cancelled OS prompt as a normal outcome, not a failure', () => {
    expect(PasskeyHelper.isCancellation({ error: named(PASSKEY_SPEC.CANCELLED) })).toBe(true);
    expect(PasskeyHelper.isCancellation({ error: named(PASSKEY_SPEC.ABORTED) })).toBe(true);
  });

  it('does not hide a real failure behind a cancellation', () => {
    expect(PasskeyHelper.isCancellation({ error: named(PASSKEY_SPEC.OTHER) })).toBe(false);
    expect(PasskeyHelper.isCancellation({ error: PASSKEY_SPEC.OTHER })).toBe(false);
  });

  it('names the device from the agent, and falls back rather than guessing', () => {
    withAgent(PASSKEY_SPEC.IPHONE_AGENT);
    expect(PasskeyHelper.deviceLabel()).toBe(PASSKEY_SPEC.IPHONE_LABEL);

    withAgent(PASSKEY_SPEC.WINDOWS_AGENT);
    expect(PasskeyHelper.deviceLabel()).toBe(PASSKEY_SPEC.WINDOWS_LABEL);

    withAgent(PASSKEY_SPEC.UNKNOWN_AGENT);
    expect(PasskeyHelper.deviceLabel()).toBe(PASSKEY_SPEC.DEFAULT_LABEL);
  });

  it('issues a fresh challenge handle every time, so two ceremonies never share one', () => {
    const first = PasskeyHelper.owner();
    const second = PasskeyHelper.owner();

    expect(first).toHaveLength(PASSKEY_SPEC.OWNER_LENGTH);
    expect(first).toMatch(/^[0-9a-f]+$/);
    expect(second).not.toBe(first);
  });
});
