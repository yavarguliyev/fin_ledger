import { Kafka, logLevel } from 'kafkajs';
import { CryptoHelper } from '@common/shared-libs';

import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import { SentEmail } from '../interfaces/sent-email.interface';
import { WaitForEmail } from '../interfaces/wait-for-email.interface';

export class EmailInboxHelper {
  private static readonly TIMEOUT_MS = 20_000;

  static async waitFor ({ to, topic, count = 1 }: WaitForEmail): Promise<SentEmail> {
    const kafka = new Kafka({ clientId: 'integration-inbox', brokers: [process.env[TEST_ENV_KEYS.KAFKA_BROKERS] as string], logLevel: logLevel.NOTHING });
    const consumer = kafka.consumer({ groupId: `integration-inbox-${CryptoHelper.uuid()}` });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    return new Promise<SentEmail>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Fewer than ${count} emails to ${to} on ${topic}`)), EmailInboxHelper.TIMEOUT_MS);
      let received = 0;

      void consumer.run({
        eachMessage: async ({ message }) => {
          const email = JSON.parse(message.value?.toString() ?? '{}') as SentEmail;
          if (email.to !== to || ++received < count) return;

          clearTimeout(timer);
          resolve(email);
        }
      });
    }).finally(() => consumer.disconnect());
  }
}
