import { InternalServerErrorException } from '@nestjs/common';
import { KAFKA_PUBLISH_METADATA, KAFKA_SERVICE, UnknownRecord } from '@common/shared-libs';

import { KafkaPublishDecoratorRecord } from '../interfaces/kafka.interface';

export const KafkaPublish = (options: KafkaPublishDecoratorRecord): MethodDecorator => {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    descriptor.value = async function (
      this: { [KAFKA_SERVICE]?: { publish: (payload: UnknownRecord, options: { topic: string; key?: string }) => Promise<void> } },
      ...args: unknown[]
    ): Promise<unknown> {
      const result = await originalMethod.apply(this, args);
      const kafkaService = this[KAFKA_SERVICE];

      if (!kafkaService) throw new InternalServerErrorException('KafkaService not found. Ensure KafkaModule is imported.');

      const key = typeof options.key === 'function' ? options.key(result, args) : options.key;
      const payload = result as UnknownRecord;

      if (key) await kafkaService.publish(payload, { topic: options.topic, key });
      else await kafkaService.publish(payload, { topic: options.topic });

      return result;
    };

    Reflect.defineMetadata(KAFKA_PUBLISH_METADATA, options, target, propertyKey);
  };
};
