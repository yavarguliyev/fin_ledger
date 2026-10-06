import { BaseHelper } from '@common/shared-libs';

import { CancelConsumersDto } from '../dtos/step/cancel-consumers.dto';
import { CloseConnectionDto } from '../dtos/step/close-connection.dto';

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

  static async close ({ channel, connection, logger }: CloseConnectionDto): Promise<void> {
    try {
      await channel?.close();
      await connection?.close();
    } catch (error) {
      logger.warn(`Could not close the RabbitMQ connection cleanly: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }
}
