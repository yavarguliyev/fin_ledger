import { ConfigResourceTypes } from 'kafkajs';
import { BaseHelper, KAFKA_RETENTION } from '@common/shared-libs';

import { ApplyTopicRetentionDto } from '../dtos/helper/apply-topic-retention.dto';

export class TopicRetentionHelper {
  static async apply ({ kafka, topics, retentionMs, logger }: ApplyTopicRetentionDto): Promise<void> {
    if (topics.length === 0) return;
    const admin = kafka.admin();

    try {
      await admin.connect();
      const existing = new Set(await admin.listTopics());
      const resources = topics
        .filter(topic => existing.has(topic))
        .map(name => ({
          type: ConfigResourceTypes.TOPIC,
          name,
          configEntries: [{ name: KAFKA_RETENTION.CONFIG_NAME, value: String(retentionMs) }]
        }));

      if (resources.length > 0) await admin.alterConfigs({ validateOnly: false, resources });
    } catch (error) {
      logger.warn(`Failed to set Kafka topic retention: ${BaseHelper.errorResponse({ error }).message}`);
    } finally {
      await admin.disconnect();
    }
  }
}
