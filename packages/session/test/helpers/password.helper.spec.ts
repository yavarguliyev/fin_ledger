import { PasswordHelper } from '../../src/modules/helpers/password.helper';
import { PASSWORD_SPEC } from '../constants/password.constant';

describe('PasswordHelper.matches', () => {
  it('accepts the password it hashed', async () => {
    const hash = await PasswordHelper.hash({ password: PASSWORD_SPEC.PASSWORD });

    await expect(PasswordHelper.matches({ password: PASSWORD_SPEC.PASSWORD, passwordHash: hash })).resolves.toBe(true);
  });

  it('refuses a different password against a real hash', async () => {
    const hash = await PasswordHelper.hash({ password: PASSWORD_SPEC.PASSWORD });

    await expect(PasswordHelper.matches({ password: PASSWORD_SPEC.WRONG_PASSWORD, passwordHash: hash })).resolves.toBe(false);
  });

  it('produces an argon2id hash, which is the only format we store', async () => {
    const hash = await PasswordHelper.hash({ password: PASSWORD_SPEC.PASSWORD });

    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('refuses a hash in any other format rather than guessing at it', async () => {
    const rejected = [PASSWORD_SPEC.BCRYPT_HASH, PASSWORD_SPEC.PLAIN_TEXT, PASSWORD_SPEC.EMPTY];

    for (const passwordHash of rejected) {
      await expect(PasswordHelper.matches({ password: PASSWORD_SPEC.PASSWORD, passwordHash })).resolves.toBe(false);
    }
  });
});
