import { InternalServerErrorException } from '@nestjs/common';
import { BaseHelper } from '@common/shared-libs';

import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { ConfirmedPublishDto } from '../dtos/step/confirmed-publish.dto';

export class PublishHelper {
  static async confirmed ({ channel, exchange, routingKey, content, persistent, headers }: ConfirmedPublishDto): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new InternalServerErrorException(`RabbitMQ did not confirm ${routingKey} within ${RABBITMQ_CONSTANTS.PUBLISH_CONFIRM_TIMEOUT_MS.key}ms`)),
        RABBITMQ_CONSTANTS.PUBLISH_CONFIRM_TIMEOUT_MS.key
      );

      channel.publish(exchange, routingKey, content, { persistent, ...(headers && { headers }) }, error => {
        clearTimeout(timer);

        if (error) reject(new InternalServerErrorException(`RabbitMQ rejected ${routingKey}: ${BaseHelper.errorResponse({ error }).message}`));
        else resolve();
      });
    });
  }
}
