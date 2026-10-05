import { generateSync } from 'otplib';

import { ACCOUNT_EMAIL_ATOMICITY as A } from '../constants/account-email-atomicity.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { SEED_PASSWORD } from '../constants/seed-password.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { MfaTestHelper } from '../helpers/mfa-test.helper';
import { TestUserHelper } from '../helpers/test-user.helper';
import { AtomicCountRow, AtomicEmailsRow, AtomicEnabledRow, AtomicEventDto, AtomicUserDto } from '../interfaces/account-email-atomicity.interface';

const mfaEnabled = async ({ userId }: AtomicUserDto): Promise<boolean | undefined> => {
  const [row] = await DbHelper.query<AtomicEnabledRow>({ sql: A.MFA_ENABLED_SQL, params: [userId] });
  return row?.enabled;
};

const events = async ({ userId, eventType }: AtomicEventDto): Promise<number> => {
  const [row] = await DbHelper.query<AtomicCountRow>({ sql: A.OUTBOX_SQL, params: [userId, eventType] });
  return row?.count ?? 0;
};

const failOutbox = (): Promise<unknown> => DbHelper.query({ sql: A.CREATE_TRIGGER_SQL });

const healOutbox = (): Promise<unknown> => DbHelper.query({ sql: A.DROP_TRIGGER_SQL });

beforeAll(async () => {
  await TestUserHelper.ensure({ emails: [A.ENABLE_EMAIL, A.DISABLE_EMAIL, A.CHANGE_EMAIL] });
  await DbHelper.query({ sql: A.CREATE_FUNCTION_SQL });
});

afterEach(async () => healOutbox());

afterAll(async () => {
  await DbHelper.query({ sql: A.DROP_FUNCTION_SQL });
  await DbHelper.close();
});

describe('Account e-mails: turning two-factor on', () => {
  it('leaves two-factor off when the "two-factor on" e-mail cannot be queued', async () => {
    const userId = await TestUserHelper.idOf({ email: A.ENABLE_EMAIL });
    const token = await ApiHelper.login({ email: A.ENABLE_EMAIL });
    const secret = MfaTestHelper.secretOf((await MfaTestHelper.setup({ token })).body);

    await failOutbox();
    const failed = await ApiHelper.request({ method: 'POST', path: A.ENABLE_PATH, token, body: { code: generateSync({ secret }) } });

    expect(failed.status).toBe(A.SERVER_ERROR);
    await expect(mfaEnabled({ userId })).resolves.toBe(false);

    await healOutbox();
    await MfaTestHelper.enrol({ token });

    await expect(mfaEnabled({ userId })).resolves.toBe(true);
    await expect(events({ userId, eventType: A.MFA_ENABLED_EVENT })).resolves.toBe(1);
  });
});

describe('Account e-mails: turning two-factor off', () => {
  it('leaves two-factor on when the "two-factor off" e-mail cannot be queued', async () => {
    const userId = await TestUserHelper.idOf({ email: A.DISABLE_EMAIL });
    const token = await ApiHelper.login({ email: A.DISABLE_EMAIL });
    const { secret } = await MfaTestHelper.enrol({ token });

    await failOutbox();
    const failed = await MfaTestHelper.disable({ token, code: MfaTestHelper.nextWindowCode({ secret }) });

    expect(failed.status).toBe(A.SERVER_ERROR);
    await expect(mfaEnabled({ userId })).resolves.toBe(true);

    await healOutbox();
    const disabled = await MfaTestHelper.disable({ token, code: MfaTestHelper.nextWindowCode({ secret }) });

    expect(disabled.status).toBe(A.CREATED);
    await expect(mfaEnabled({ userId })).resolves.toBe(false);
    await expect(events({ userId, eventType: A.MFA_DISABLED_EVENT })).resolves.toBe(1);
  });
});

describe('Account e-mails: confirming an address change', () => {
  it('keeps the old address when the "address changed" notice cannot be queued, and the link still works afterwards', async () => {
    const userId = await TestUserHelper.idOf({ email: A.CHANGE_EMAIL });
    const token = await ApiHelper.login({ email: A.CHANGE_EMAIL });

    await ApiHelper.request({ method: 'POST', path: A.CHANGE_EMAIL_PATH, token, body: { newEmail: A.NEW_EMAIL, currentPassword: SEED_PASSWORD } });
    const sent = await EmailInboxHelper.waitFor({ to: A.NEW_EMAIL, topic: EMAIL_TOPICS.EMAIL_CHANGE_CONFIRM });
    const confirm = { method: 'POST', path: A.CONFIRM_EMAIL_CHANGE_PATH, body: { token: new URL(sent.url).searchParams.get(A.TOKEN_PARAM) } } as const;

    await failOutbox();
    await expect(ApiHelper.request(confirm)).resolves.toMatchObject({ status: A.SERVER_ERROR });
    await expect(DbHelper.query<AtomicEmailsRow>({ sql: A.EMAILS_SQL, params: [userId] })).resolves.toEqual([
      { email: A.CHANGE_EMAIL, pending_email: A.NEW_EMAIL }
    ]);

    await healOutbox();
    await expect(ApiHelper.request(confirm)).resolves.toMatchObject({ status: A.CREATED });
    await expect(DbHelper.query<AtomicEmailsRow>({ sql: A.EMAILS_SQL, params: [userId] })).resolves.toEqual([{ email: A.NEW_EMAIL, pending_email: null }]);
    await expect(events({ userId, eventType: A.EMAIL_CHANGED_EVENT })).resolves.toBe(1);
  });
});
