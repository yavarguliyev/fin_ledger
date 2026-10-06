import { EVENT_ENVELOPE } from '@common/contracts';
import { UnknownRecord, BaseHelper, RequestScope } from '@common/shared-libs';

import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { RABBITMQ_TOPOLOGY } from '../constants/messaging/topology.constant';
import { HandleMessageDto } from '../dtos/step/handle-message.dto';
import { ParkMessageDto } from '../dtos/step/park-message.dto';
import { PublishHelper } from './publish.helper';
import { QueueHelper } from './queue.helper';
import { SettleHelper } from './settle.helper';

export class ConsumeHelper {
  static async handle ({ channel, queue, message, handler, logger, inbox }: HandleMessageDto): Promise<void> {
    if (!message) return;

    try {
      await RequestScope.runSystem(() => ConsumeHelper.process({ channel, queue, message, handler, logger, ...(inbox && { inbox }) }));
      SettleHelper.settle({ channel, message, requeue: false, logger });
    } catch (error) {
      const lastError = BaseHelper.errorResponse({ error }).message;
      const attempt = Number(message.properties.headers?.[RABBITMQ_TOPOLOGY.ATTEMPTS_HEADER] ?? 0) + 1;

      await ConsumeHelper.park({ channel, queue, message, attempt, lastError, logger });
    }
  }

  private static async process ({ queue, message, handler, logger, inbox }: HandleMessageDto): Promise<void> {
    if (!message) return;

    const payload = JSON.parse(message.content.toString()) as UnknownRecord;
    const eventId = message.properties.headers?.[EVENT_ENVELOPE.HEADERS.ID] as string | undefined;

    if (!inbox || !eventId) {
      await handler(payload);
      return;
    }

    if (!(await inbox.markProcessed({ consumer: queue, messageId: eventId, topic: queue }))) {
      logger.log(`${queue} already handled ${eventId}, skipping the replay`);
      return;
    }

    try {
      await handler(payload);
    } catch (error) {
      await inbox.release({ consumer: queue, messageId: eventId });
      throw error;
    }
  }

  private static async park ({ channel, queue, message, attempt, lastError, logger }: ParkMessageDto): Promise<void> {
    const exhausted = QueueHelper.isExhausted({ attempt });
    const target = exhausted ? QueueHelper.deadLetterQueue({ queue }) : QueueHelper.retryQueue({ queue, attempt });

    try {
      await PublishHelper.confirmed({
        channel,
        exchange: RABBITMQ_CONSTANTS.RABBITMQ_DLX_EXCHANGE.key,
        routingKey: target,
        content: message.content,
        persistent: true,
        headers: {
          ...message.properties.headers,
          [RABBITMQ_TOPOLOGY.ATTEMPTS_HEADER]: attempt,
          [RABBITMQ_TOPOLOGY.ERROR_HEADER]: lastError.slice(0, RABBITMQ_TOPOLOGY.ERROR_MAX_LENGTH),
          [RABBITMQ_TOPOLOGY.QUEUE_HEADER]: queue
        }
      });

      SettleHelper.settle({ channel, message, requeue: false, logger });

      if (exhausted) logger.error(`Message from ${queue} parked in ${target} after ${attempt} attempts: ${lastError}`);
      else logger.warn(`Message from ${queue} failed (attempt ${attempt}), retrying via ${target}: ${lastError}`);
    } catch (error) {
      logger.error(`Could not move a failed message off ${queue}: ${BaseHelper.errorResponse({ error }).message}`);
      SettleHelper.settle({ channel, message, requeue: true, logger });
    }
  }
}
