import { setTimeout as sleep } from 'node:timers/promises';
import { BaseHelper, RequestScope } from '@common/shared-libs';

import { KAFKA_CONSUMER } from '../constants/messaging/consumer.constant';
import { DispatchAllDto, DispatchDto } from '../dtos/step/dispatch.dto';
import { ParkDto } from '../dtos/step/park.dto';
import { RetryHelper } from './retry.helper';
import { TopicHelper } from './topic.helper';

export class DispatchHelper {
  static async runAll ({ handlers, ...context }: DispatchAllDto): Promise<void> {
    for (const handler of handlers) await DispatchHelper.run({ ...context, handler });
  }

  static async run ({ handler, record, payload, send, consumerGroup, inboxRepository, logger }: DispatchDto): Promise<void> {
    const handlerName = handler.name || 'handler';
    const consumer = `${consumerGroup}:${handlerName}`;
    const messageId = RetryHelper.messageIdOf({ payload });
    let lastError = '';

    if (await inboxRepository.wasProcessed({ consumer, messageId })) {
      logger.log(`${handlerName} already handled ${messageId}, skipping the replay`);
      return;
    }

    for (let attempt = 1; attempt <= KAFKA_CONSUMER.IN_PROCESS_ATTEMPTS; attempt += 1) {
      try {
        await RequestScope.runSystem(() => handler(record));
        await inboxRepository.markProcessed({ consumer, messageId, topic: record.topic });
        return;
      } catch (error) {
        lastError = BaseHelper.errorResponse({ error }).message;
        if (attempt < KAFKA_CONSUMER.IN_PROCESS_ATTEMPTS) await sleep(KAFKA_CONSUMER.IN_PROCESS_BACKOFF_MS * attempt);
      }
    }

    await DispatchHelper.park({ payload, handlerName, attempt: RetryHelper.attemptOf({ message: payload.message }) + 1, lastError, send, logger });
  }

  private static async park ({ payload, handlerName, attempt, lastError, send, logger }: ParkDto): Promise<void> {
    const originTopic = TopicHelper.originTopic({ topic: payload.topic });
    const exhausted = TopicHelper.isRetryTopic({ topic: payload.topic });
    const target = exhausted ? TopicHelper.deadLetterTopic({ topic: originTopic }) : TopicHelper.retryTopic({ topic: originTopic });

    try {
      await send({
        topic: target,
        payload: payload.message.value ? (JSON.parse(payload.message.value.toString()) as unknown) : null,
        key: payload.message.key?.toString() ?? null,
        headers: RetryHelper.headers({ payload, handlerName, attempt, lastError })
      });

      if (exhausted)
        logger.error(`${handlerName} gave up on a message from ${originTopic} after ${attempt} attempts, parked in ${target}: ${lastError}`);
      else logger.warn(`${handlerName} failed on ${originTopic} (attempt ${attempt}), moved to ${target}: ${lastError}`);
    } catch (error) {
      logger.error(`Could not move a failed message off ${originTopic}: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }
}
