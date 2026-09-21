import { KAFKA_SUBSCRIBER_METADATA } from '@common/shared-libs';

import { KafkaSubscriberMetadataRecord } from '../interfaces/kafka-subscriber-metadata-record.interface';
import { KafkaSubscribeOptionsDto } from '../dtos/decorator/kafka-subscribe-options.dto';

export const KafkaSubscribe = (options: KafkaSubscribeOptionsDto): MethodDecorator => {
  return (target: object, propertyKey: string | symbol): void => {
    const metadata = Reflect.getMetadata(KAFKA_SUBSCRIBER_METADATA, target.constructor) as KafkaSubscriberMetadataRecord[];
    const existingMetadata: KafkaSubscriberMetadataRecord[] = metadata || [];

    Reflect.defineMetadata(KAFKA_SUBSCRIBER_METADATA, [...existingMetadata, { methodName: propertyKey, options }], target.constructor);
  };
};
