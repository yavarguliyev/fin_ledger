import { CryptoHelper } from '@common/shared-libs';

import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { LINK_TOKENS } from '../constants/link-tokens.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { LinkResetDto, LinkResetRequestDto, LinkUrlDto, LinkVerifyDto } from '../interfaces/link-tokens.interface';

afterAll(async () => DbHelper.close());

const tokenFrom = ({ url }: LinkUrlDto): string => new URL(url).searchParams.get(LINK_TOKENS.TOKEN_PARAM) as string;

const requestReset = async ({ email, count = 1 }: LinkResetRequestDto): Promise<string> => {
  await ApiHelper.request({ method: 'POST', path: LINK_TOKENS.FORGOT_PATH, body: { email } });
  return tokenFrom(await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.PASSWORD_RESET, count }));
};

const resetPassword = ({ token, password }: LinkResetDto): Promise<{ status: number }> =>
  ApiHelper.request({ method: 'POST', path: LINK_TOKENS.RESET_PATH, body: { token, password } });

const verifyEmail = ({ token, password }: LinkVerifyDto): Promise<{ status: number }> =>
  ApiHelper.request({ method: 'POST', path: LINK_TOKENS.VERIFY_PATH, body: { token, ...(password && { password }) } });

describe('Emailed one-time links', () => {
  it('stores only a SHA-256 hash of the token', async () => {
    const token = await requestReset({ email: LINK_TOKENS.HASH_EMAIL });
    const hash = CryptoHelper.sha256({ value: token });

    await expect(DbHelper.query({ sql: LINK_TOKENS.COUNT_BY_HASH_SQL, params: [hash] })).resolves.toEqual(LINK_TOKENS.ONE_ROW);
    await expect(DbHelper.query({ sql: LINK_TOKENS.COUNT_BY_HASH_SQL, params: [token] })).resolves.toEqual(LINK_TOKENS.NO_ROW);
  });

  it('lets a password-reset link be used exactly once', async () => {
    const email = LINK_TOKENS.ONCE_EMAIL;
    const token = await requestReset({ email });

    await expect(resetPassword({ token, password: LINK_TOKENS.ONCE_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.CREATED });
    await expect(resetPassword({ token, password: LINK_TOKENS.TWICE_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.BAD_REQUEST });
    await expect(ApiHelper.login({ email, password: LINK_TOKENS.ONCE_PASSWORD })).resolves.toEqual(expect.any(String));
  });

  it('revokes the previous link when a new one is sent', async () => {
    const email = LINK_TOKENS.REVOKE_EMAIL;
    const first = await requestReset({ email, count: 1 });
    const second = await requestReset({ email, count: 2 });

    await expect(resetPassword({ token: first, password: LINK_TOKENS.FIRST_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.BAD_REQUEST });
    await expect(resetPassword({ token: second, password: LINK_TOKENS.SECOND_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.CREATED });
  });

  it('rejects an expired link', async () => {
    const token = await requestReset({ email: LINK_TOKENS.EXPIRED_EMAIL });
    const hash = CryptoHelper.sha256({ value: token });

    await DbHelper.query({ sql: LINK_TOKENS.EXPIRE_SQL, params: [hash] });

    await expect(resetPassword({ token, password: LINK_TOKENS.LATE_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.BAD_REQUEST });
    await expect(ApiHelper.login({ email: LINK_TOKENS.EXPIRED_EMAIL, password: SEED_PASSWORD })).resolves.toEqual(expect.any(String));
  });
});

describe('Emailed one-time links: purposes', () => {
  it('keeps each purpose to its own endpoint', async () => {
    const resetToken = await requestReset({ email: LINK_TOKENS.PURPOSE_EMAIL });

    await expect(verifyEmail({ token: resetToken, password: LINK_TOKENS.CROSS_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.BAD_REQUEST });
    await expect(resetPassword({ token: resetToken, password: LINK_TOKENS.STILL_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.CREATED });
  });

  it('requires a password for an invitation and does not spend the link without one', async () => {
    const globalAdmin = await ApiHelper.login({ email: LINK_TOKENS.GLOBAL_ADMIN_EMAIL });
    const email = LINK_TOKENS.INVITE_EMAIL;

    await ApiHelper.request({
      method: 'POST',
      path: LINK_TOKENS.USERS_PATH,
      token: globalAdmin,
      body: { email, displayName: LINK_TOKENS.INVITE_NAME, role: LINK_TOKENS.INVITE_ROLE }
    });
    const token = tokenFrom(await EmailInboxHelper.waitFor({ to: email, topic: EMAIL_TOPICS.EMAIL_VERIFICATION }));

    await expect(verifyEmail({ token })).resolves.toMatchObject({ status: LINK_TOKENS.BAD_REQUEST });
    await expect(verifyEmail({ token, password: LINK_TOKENS.INVITE_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.CREATED });
    await expect(verifyEmail({ token, password: LINK_TOKENS.INVITE_AGAIN_PASSWORD })).resolves.toMatchObject({ status: LINK_TOKENS.BAD_REQUEST });
  });
});
