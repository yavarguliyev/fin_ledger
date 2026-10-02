import { Kafka, logLevel } from 'kafkajs';
import { CryptoHelper } from '@common/shared-libs';

import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { EMAIL_INBOX } from '../constants/email-inbox.constant';
import { SentEmail } from '../interfaces/sent-email.interface';
import { RawEmailEvent } from '../interfaces/raw-email-event.interface';
import { WaitForEmail } from '../interfaces/wait-for-email.interface';

export class EmailInboxHelper {
  private static readonly TIMEOUT_MS = 20_000;

  static async waitFor ({ to, topic, count = 1 }: WaitForEmail): Promise<SentEmail> {
    const kafka = new Kafka({
      clientId: 'integration-inbox',
      brokers: [process.env[TEST_ENV_KEYS.KAFKA_BROKERS] as string],
      logLevel: logLevel.NOTHING
    });
    const consumer = kafka.consumer({ groupId: `integration-inbox-${CryptoHelper.uuid()}` });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    return new Promise<SentEmail>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Fewer than ${count} emails to ${to} on ${topic}`)), EmailInboxHelper.TIMEOUT_MS);
      let received = 0;

      void consumer.run({
        eachMessage: ({ message }) => {
          const email = JSON.parse(message.value?.toString() ?? '{}') as RawEmailEvent;
          if (email.to !== to || ++received < count) return Promise.resolve();

          clearTimeout(timer);
          resolve(EmailInboxHelper.open(email));
          return Promise.resolve();
        }
      });
    }).finally(() => consumer.disconnect());
  }

  static open ({ sealedUrl, url, ...email }: RawEmailEvent): SentEmail {
    if (!sealedUrl) return { ...email, url: url ?? EMAIL_INBOX.NO_URL };
    const key = Buffer.from(process.env[TEST_ENV_KEYS.EMAIL_LINK_KEY] as string, EMAIL_INBOX.KEY_ENCODING);
    const encrypted = Buffer.from(sealedUrl.slice(EMAIL_INBOX.SEALED_PREFIX.length), EMAIL_INBOX.SEALED_ENCODING);
    return { ...email, url: CryptoHelper.decrypt({ encrypted, key }) };
  }
}
