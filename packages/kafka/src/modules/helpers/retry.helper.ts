import { setTimeout as sleep } from 'node:timers/promises';
import type { IHeaders, KafkaMessage } from 'kafkajs';

import { KAFKA_CONSUMER } from '../constants/messaging/consumer.constant';
import { ParkDto } from '../dtos/step/park.dto';

export class RetryHelper {
  static messageIdOf ({ payload }: { payload: import('kafkajs').EachMessagePayload }): string {
    const { topic, partition, message } = payload;
    const originTopic = message.headers?.[KAFKA_CONSUMER.TOPIC_HEADER]?.toString() ?? topic;
    const originPartition = message.headers?.[KAFKA_CONSUMER.PARTITION_HEADER]?.toString() ?? String(partition);
    const originOffset = message.headers?.[KAFKA_CONSUMER.OFFSET_HEADER]?.toString() ?? message.offset;

    return `${originTopic}:${originPartition}:${originOffset}`;
  }

  static attemptOf ({ message }: { message: KafkaMessage }): number {
    return Number(message.headers?.[KAFKA_CONSUMER.ATTEMPTS_HEADER]?.toString() ?? 0);
  }

  static headers ({ payload, handlerName, attempt, lastError }: Omit<ParkDto, 'send' | 'logger'>): IHeaders {
    const { topic, partition, message } = payload;

    return {
      ...message.headers,
      [KAFKA_CONSUMER.ATTEMPTS_HEADER]: String(attempt),
      [KAFKA_CONSUMER.ERROR_HEADER]: lastError.slice(0, KAFKA_CONSUMER.ERROR_MAX_LENGTH),
      [KAFKA_CONSUMER.TOPIC_HEADER]: message.headers?.[KAFKA_CONSUMER.TOPIC_HEADER]?.toString() ?? topic,
      [KAFKA_CONSUMER.PARTITION_HEADER]: message.headers?.[KAFKA_CONSUMER.PARTITION_HEADER]?.toString() ?? String(partition),
      [KAFKA_CONSUMER.OFFSET_HEADER]: message.headers?.[KAFKA_CONSUMER.OFFSET_HEADER]?.toString() ?? message.offset,
      [KAFKA_CONSUMER.HANDLER_HEADER]: handlerName,
      [KAFKA_CONSUMER.RETRY_AT_HEADER]: String(Date.now() + KAFKA_CONSUMER.RETRY_DELAY_MS)
    };
  }

  static async waitUntilDue ({ message }: { message: KafkaMessage }): Promise<void> {
    const retryAt = Number(message.headers?.[KAFKA_CONSUMER.RETRY_AT_HEADER]?.toString() ?? 0);
    const remaining = Math.min(retryAt - Date.now(), KAFKA_CONSUMER.MAX_RETRY_WAIT_MS);
    if (remaining > 0) await sleep(remaining);
  }
}
