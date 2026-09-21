import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

import { KafkaMetricsRecord } from '../interfaces/kafka-metrics-record.interface';
import { ReplicatedPartitionsDto } from '../dtos/metrics/replicated-partitions.dto';
import { CalculateTotalMessagesDto } from '../dtos/metrics/calculate-total-messages.dto';
import { MessagesPerSecondDto } from '../dtos/metrics/messages-per-second.dto';

@Injectable()
export class KafkaMetrics {
  private lastTotalMessages = 0;
  private lastMetricsTimestamp = Date.now();

  constructor (private readonly kafka: Kafka) {}

  async getKafkaMetrics (): Promise<KafkaMetricsRecord> {
    const admin = this.kafka.admin();
    await admin.connect();

    const topicMetadata = await admin.fetchTopicMetadata();
    const underReplicatedPartitions = this.calculateUnderReplicatedPartitions({ topicMetadata });
    const currentTotalMessages = await this.calculateTotalMessages({ admin, topicMetadata });

    await admin.disconnect();

    const messagesInPerSec = this.calculateMessagesPerSecond({ currentTotalMessages });

    return {
      messagesInPerSec: parseFloat(messagesInPerSec.toFixed(2)),
      underReplicatedPartitions
    };
  }

  private calculateUnderReplicatedPartitions ({ topicMetadata }: ReplicatedPartitionsDto): number {
    let underReplicatedPartitions = 0;

    topicMetadata.topics.forEach(topic => {
      topic.partitions.forEach(partition => {
        if (partition.replicas.length !== partition.isr.length) {
          underReplicatedPartitions++;
        }
      });
    });

    return underReplicatedPartitions;
  }

  private async calculateTotalMessages ({ topicMetadata, admin }: CalculateTotalMessagesDto): Promise<number> {
    let currentTotalMessages = 0;

    for (const topic of topicMetadata.topics) {
      if (topic.name.startsWith('__')) continue;

      const offsets = await admin.fetchTopicOffsets(topic.name);

      offsets.forEach(partitionOffset => {
        const highOffset = parseInt(partitionOffset.high ?? '0', 10);
        currentTotalMessages += highOffset;
      });
    }

    return currentTotalMessages;
  }

  private calculateMessagesPerSecond ({ currentTotalMessages }: MessagesPerSecondDto): number {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastMetricsTimestamp) / 1000;
    const delta = currentTotalMessages - this.lastTotalMessages;
    const messagesInPerSec = elapsedSeconds > 0 ? Math.max(0, delta / elapsedSeconds) : 0;

    this.lastTotalMessages = currentTotalMessages;
    this.lastMetricsTimestamp = now;

    return messagesInPerSec;
  }
}
