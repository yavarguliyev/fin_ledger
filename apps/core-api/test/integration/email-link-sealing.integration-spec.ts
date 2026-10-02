import { Kafka, logLevel } from 'kafkajs';
import { CryptoHelper } from '@common/shared-libs';

import { EMAIL_LINK_SEALING_TEST as T } from '../constants/email-link-sealing.constant';
import { EMAIL_TOPICS } from '../constants/email-topics.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { ApiHelper } from '../helpers/api.helper';
import { DbHelper } from '../helpers/db.helper';
import { EmailInboxHelper } from '../helpers/email-inbox.helper';
import { TestUserHelper } from '../helpers/test-user.helper';

const rawResetMessages = async (): Promise<string[]> => {
  const kafka = new Kafka({ clientId: `sealing-${CryptoHelper.uuid()}`, brokers: [process.env[TEST_ENV_KEYS.KAFKA_BROKERS] as string], logLevel: logLevel.NOTHING });
  const admin = kafka.admin();
  await admin.connect();
  const offsets = await admin.fetchTopicOffsets(EMAIL_TOPICS.PASSWORD_RESET);
  await admin.disconnect();

  const consumer = kafka.consumer({ groupId: `sealing-${CryptoHelper.uuid()}` });
  const values: string[] = [];
  const total = offsets.reduce((sum, partition) => sum + Number(partition.high), 0);
  await consumer.connect();
  await consumer.subscribe({ topic: EMAIL_TOPICS.PASSWORD_RESET, fromBeginning: true });

  await new Promise<void>(resolve => {
    void consumer.run({
      eachMessage: ({ message }) => {
        values.push(message.value?.toString() ?? '');
        if (values.length >= total) resolve();
        return Promise.resolve();
      }
    });
  });

  await consumer.disconnect();
  return values;
};

describe('E-mail links are sealed in the outbox and Kafka', () => {
  beforeAll(async () => TestUserHelper.ensure({ emails: [T.EMAIL] }));

  afterAll(async () => DbHelper.close());

  it('keeps the reset token out of the outbox and the topic while the e-mail still carries a working link', async () => {
    await expect(ApiHelper.request({ method: 'POST', path: T.FORGOT_PATH, body: { email: T.EMAIL } })).resolves.toMatchObject({ status: T.OK });

    const sent = await EmailInboxHelper.waitFor({ to: T.EMAIL, topic: EMAIL_TOPICS.PASSWORD_RESET });
    const [row] = await DbHelper.query<{ payload: string }>({ sql: T.OUTBOX_SQL, params: [T.EMAIL] });
    const messages = await rawResetMessages();

    expect(sent.url).toContain(T.TOKEN_MARKER);
    expect(row?.payload).toContain(T.SEALED_PREFIX);
    expect(row?.payload).not.toContain(T.TOKEN_MARKER);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages.filter(value => value.includes(T.TOKEN_MARKER))).toEqual([]);
  });
});
