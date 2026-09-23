import { BaseHelper } from '@common/shared-libs';

import { SettleMessageDto } from '../dtos/step/settle-message.dto';

export class SettleHelper {
  static settle ({ channel, message, requeue, logger }: SettleMessageDto): void {
    try {
      if (requeue) channel.nack(message, false, true);
      else channel.ack(message);
    } catch (error) {
      logger.warn(`Could not settle a message from ${message.fields.routingKey}: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }
}
