import { MessageHandler, UnknownRecord } from '@common/shared-libs';

import { KAFKA_CONSUMER } from '../constants/messaging/consumer.constant';
import { SubscriberMethodDto } from '../dtos/consumer/subscriber-method.dto';
import { KafkaMessageRecord } from '../interfaces/kafka-message-record.interface';

export class SubscriberHelper {
  static bind ({ instance, methodName }: SubscriberMethodDto): MessageHandler<KafkaMessageRecord> | null {
    const handler = (instance as UnknownRecord)[methodName as string];
    if (typeof handler !== 'function') return null;

    const bound = handler.bind(instance) as MessageHandler<KafkaMessageRecord>;
    Object.defineProperty(bound, KAFKA_CONSUMER.NAME_PROPERTY, { value: SubscriberHelper.nameOf({ instance, methodName }) });
    return bound;
  }

  static nameOf ({ instance, methodName }: SubscriberMethodDto): string {
    return [instance.constructor.name, String(methodName)].join(KAFKA_CONSUMER.HANDLER_NAME_SEPARATOR);
  }
}
