import { ConfigResourceTypes, Kafka, logLevel } from 'kafkajs';

import { KAFKA_RETENTION_TEST as T } from '../constants/kafka-retention.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

const retentionOf = async (topic: string): Promise<string | undefined> => {
  const admin = new Kafka({ clientId: T.CLIENT_ID, brokers: [process.env[TEST_ENV_KEYS.KAFKA_BROKERS] as string], logLevel: logLevel.NOTHING }).admin();
  await admin.connect();

  try {
    const described = await admin.describeConfigs({
      includeSynonyms: false,
      resources: [{ type: ConfigResourceTypes.TOPIC, name: topic, configNames: [T.CONFIG_NAME] }]
    });
    return described.resources[0]?.configEntries.find(entry => entry.configName === T.CONFIG_NAME)?.configValue;
  } finally {
    await admin.disconnect();
  }
};

describe('Kafka topic retention', () => {
  it('keeps e-mail events for one day only', async () => {
    await expect(retentionOf(T.EMAIL_TOPIC)).resolves.toBe(T.EMAIL_RETENTION_MS);
  });

  it('leaves other topics on the broker default', async () => {
    await expect(retentionOf(T.AUDIT_TOPIC)).resolves.not.toBe(T.EMAIL_RETENTION_MS);
  });
});
