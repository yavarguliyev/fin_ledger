import { SafeUrlHelper } from '../../src/modules/helpers/safe-url.helper';
import { SAFE_URL_SPEC as T } from '../constants/safe-url.constant';

describe('SafeUrlHelper.isPublicAddress', () => {
  it.each(T.BLOCKED)('refuses the private, reserved or invalid address %s', address => {
    expect(SafeUrlHelper.isPublicAddress({ address })).toBe(false);
  });

  it.each(T.PUBLIC)('allows the public address %s', address => {
    expect(SafeUrlHelper.isPublicAddress({ address })).toBe(true);
  });
});

describe('SafeUrlHelper.assertHttpUrl', () => {
  it.each(T.ALLOWED_URLS)('accepts %s', url => {
    expect(SafeUrlHelper.assertHttpUrl({ url }).href).toContain(new URL(url).host);
  });

  it.each(T.REFUSED_URLS)('refuses %s', url => {
    expect(() => SafeUrlHelper.assertHttpUrl({ url })).toThrow();
  });
});

describe('SafeUrlHelper.guardedLookup', () => {
  it('fails the connection when the host resolves to a loopback address', async () => {
    const error = await new Promise<NodeJS.ErrnoException | null>(resolve => SafeUrlHelper.guardedLookup(T.LOOPBACK_HOST, {}, failure => resolve(failure)));

    expect(error?.code).toBe(T.BLOCKED_CODE);
  });
});
