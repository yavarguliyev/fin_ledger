import { setTimeout as sleep } from 'node:timers/promises';
import { BaseHelper } from '@common/shared-libs';

import { RABBITMQ_TOPOLOGY } from '../constants/messaging/topology.constant';
import { CancelConsumersDto } from '../dtos/step/cancel-consumers.dto';
import { CloseConnectionDto } from '../dtos/step/close-connection.dto';
import { DrainDto } from '../dtos/step/drain.dto';

export class ShutdownHelper {
  static async cancelConsumers ({ channel, consumerTags, logger }: CancelConsumersDto): Promise<void> {
    for (const consumerTag of consumerTags) {
      try {
        await channel.cancel(consumerTag);
      } catch (error) {
        logger.warn(`Could not cancel consumer ${consumerTag}: ${BaseHelper.errorResponse({ error }).message}`);
      }
    }
  }

  static async drain ({ pending, logger }: DrainDto): Promise<void> {
    const deadline = Date.now() + RABBITMQ_TOPOLOGY.DRAIN_TIMEOUT_MS;
    while (pending() > 0 && Date.now() < deadline) await sleep(RABBITMQ_TOPOLOGY.DRAIN_POLL_MS);
    if (pending() > 0) logger.warn(`Closing with ${pending()} message(s) still in flight; they will be redelivered`);
  }

  static async close ({ channel, connection, logger }: CloseConnectionDto): Promise<void> {
    try {
      await channel?.close();
      await connection?.close();
    } catch (error) {
      logger.warn(`Could not close the RabbitMQ connection cleanly: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }
}
