import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService } from '@nestjs/core';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { ClientIds, errorResponse, KAFKA_CLIENT_ID, KAFKA_SUBSCRIBER_METADATA, MessageHandler, UnknownRecord } from '@common/shared-libs';

import { KafkaMessageRecord, KafkaSubscriberMetadataRecord, RegisterSingleSubscriberRecord } from '../interfaces/kafka.interface';
import {
  resolveBrokers,
  isValidInstance,
  ensureKafkaTopicsExist,
  buildKafkaMessage,
  createKafkaConfig,
  createConsumerConfig,
  subscribeToTopics
} from '../helpers/kafka-consumer.helper';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly clientId: ClientIds;
  private readonly subscribers: Map<string, MessageHandler<KafkaMessageRecord>[]> = new Map();
  private consumer: Consumer | null = null;

  constructor (
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
    @Optional() @Inject(KAFKA_CLIENT_ID) clientId?: ClientIds
  ) {
    this.clientId = clientId || ClientIds.DEAFULT;
    this.logger = new Logger(`${KafkaConsumerService.name}:${this.clientId}`);
  }

  async onModuleInit (): Promise<void> {
    this.discoverSubscribers();

    if (this.subscribers.size === 0) {
      this.logger.log('No Kafka subscribers found, skipping consumer initialization');
      return;
    }

    await this.initializeConsumer();
  }

  async onModuleDestroy (): Promise<void> {
    await this.consumer?.disconnect();
  }

  private discoverSubscribers (): void {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      if (isValidInstance(wrapper)) this.registerSubscribersFromInstance(wrapper.instance as object);
    }
  }

  private registerSubscribersFromInstance (instance: object): void {
    const metadata = Reflect.getMetadata(KAFKA_SUBSCRIBER_METADATA, instance.constructor) as KafkaSubscriberMetadataRecord[] | undefined;
    if (!metadata) return;
    for (const { methodName, options } of metadata) this.registerSingleSubscriber({ instance, methodName, options });
  }

  private async subscribeToTopics (): Promise<void> {
    if (!this.consumer) return;
    await subscribeToTopics(this.consumer, Array.from(this.subscribers.keys()));
  }

  private async handleMessage ({ topic, partition, message }: EachMessagePayload): Promise<void> {
    const handlers = this.subscribers.get(topic);
    if (!handlers || handlers.length === 0) return;

    try {
      for (const handler of handlers) {
        await handler(buildKafkaMessage({ topic, partition, message }));
      }
    } catch (error) {
      this.logger.error(`Failed to handle message from topic ${topic}: ${errorResponse(error).message}`);
    }
  }

  private registerSingleSubscriber ({ instance, methodName, options }: RegisterSingleSubscriberRecord): void {
    const instanceRecord = instance as UnknownRecord;
    const handler = instanceRecord[methodName as string];
    if (typeof handler !== 'function') return;

    const topic = typeof options.topic === 'string' ? options.topic : options.topic.source;
    const boundHandler = handler.bind(instance) as MessageHandler<KafkaMessageRecord>;
    const existingHandlers = this.subscribers.get(topic) || [];

    this.subscribers.set(topic, [...existingHandlers, boundHandler]);
    this.logger.log(`Registered: ${instance.constructor.name}.${String(methodName)} -> ${topic}`);
  }

  private async initializeConsumer (): Promise<void> {
    const brokers = resolveBrokers(
      this.configService.get<string>('KAFKA_BROKERS'),
      this.configService.get<string>('KAFKA_BROKER_HOST'),
      this.configService.get<number>('KAFKA_BROKER_PORT')
    );

    const groupId = this.configService.get<string>('KAFKA_CONSUMER_GROUP_ID') || `${this.clientId}-consumer-group`;
    const kafka = new Kafka(createKafkaConfig(this.clientId, brokers));
    this.consumer = kafka.consumer(createConsumerConfig(groupId));

    await this.consumer.connect();
    await ensureKafkaTopicsExist(kafka, Array.from(this.subscribers.keys()), this.logger);
    await this.subscribeToTopics();

    try {
      await this.consumer.run({ eachMessage: async (payload: EachMessagePayload): Promise<void> => await this.handleMessage(payload) });
      this.logger.log(`Kafka consumer initialized for ${this.clientId} with group: ${groupId}`);
    } catch (error) {
      this.logger.warn(`Kafka consumer group initialization warning: ${errorResponse(error).message}`);
    }
  }
}
