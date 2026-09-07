import { KAFKA_SUBSCRIBER_METADATA } from '@common/shared-libs';

import { KafkaSubscribeDecoratorRecord, KafkaSubscriberMetadataRecord } from '../interfaces/kafka.interface';

export const KafkaSubscribe = (options: KafkaSubscribeDecoratorRecord): MethodDecorator => {
  return (target: object, propertyKey: string | symbol): void => {
    const metadata = Reflect.getMetadata(KAFKA_SUBSCRIBER_METADATA, target.constructor) as KafkaSubscriberMetadataRecord[];
    const existingMetadata: KafkaSubscriberMetadataRecord[] = metadata || [];

    Reflect.defineMetadata(KAFKA_SUBSCRIBER_METADATA, [...existingMetadata, { methodName: propertyKey, options }], target.constructor);
  };
};
