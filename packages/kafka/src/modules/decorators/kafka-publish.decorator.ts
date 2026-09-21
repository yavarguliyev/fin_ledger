import { InternalServerErrorException } from '@nestjs/common';
import { KAFKA_PUBLISH_METADATA, KAFKA_SERVICE, UnknownRecord } from '@common/shared-libs';

import { KafkaPublishOptionsDto } from '../dtos/decorator/kafka-publish-options.dto';
import { KafkaPublishDto } from '../dtos/service/kafka-publish.dto';

export const KafkaPublish = (options: KafkaPublishOptionsDto): MethodDecorator => {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    descriptor.value = async function (
      this: { [KAFKA_SERVICE]?: { publish: (dto: KafkaPublishDto) => Promise<void> } },
      ...args: unknown[]
    ): Promise<unknown> {
      const result = await originalMethod.apply(this, args);
      const kafkaService = this[KAFKA_SERVICE];

      if (!kafkaService) throw new InternalServerErrorException('KafkaService not found. Ensure KafkaModule is imported.');

      const key = typeof options.key === 'function' ? options.key({ result, args }) : options.key;
      const payload = result as UnknownRecord;

      await kafkaService.publish({ payload, topic: options.topic, ...(key && { key }) });

      return result;
    };

    Reflect.defineMetadata(KAFKA_PUBLISH_METADATA, options, target, propertyKey);
  };
};
