import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService } from '@nestjs/core';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { BaseHelper, ClientIds, KAFKA_CLIENT_ID, KAFKA_SUBSCRIBER_METADATA, MessageHandler, UnknownRecord } from '@common/shared-libs';

import { KafkaMessageRecord } from '../interfaces/kafka-message-record.interface';
import { KafkaSubscriberMetadataRecord } from '../interfaces/kafka-subscriber-metadata-record.interface';
import { RegisterSubscriberDto } from '../dtos/consumer/register-subscriber.dto';
import { SubscriberInstanceDto } from '../dtos/consumer/subscriber-instance.dto';
import { KafkaMessagePayloadDto } from '../dtos/consumer/kafka-message-payload.dto';
import { KafkaHelper } from '../helpers/kafka.helper';
import { DispatchHelper } from '../helpers/dispatch.helper';
import { RetryHelper } from '../helpers/retry.helper';
import { TopicHelper } from '../helpers/topic.helper';
import { KafkaService } from './kafka.service';
import { InboxRepository } from '@common/database';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly subscribers: Map<string, MessageHandler<KafkaMessageRecord>[]> = new Map();
  private readonly logger: Logger;
  private consumer: Consumer | null = null;

  constructor (
    @Inject(KAFKA_CLIENT_ID)
    private readonly clientId: ClientIds,
    private readonly configService: ConfigService,
    private readonly discoveryService: DiscoveryService,
    private readonly kafkaService: KafkaService,
    private readonly inboxRepository: InboxRepository
  ) {
    this.clientId = clientId;
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
      if (KafkaHelper.isValidInstance(wrapper)) this.registerSubscribersFromInstance({ instance: wrapper.instance as object });
    }
  }

  private registerSubscribersFromInstance ({ instance }: SubscriberInstanceDto): void {
    const metadata = Reflect.getMetadata(KAFKA_SUBSCRIBER_METADATA, instance.constructor) as KafkaSubscriberMetadataRecord[] | undefined;
    if (!metadata) return;
    for (const { methodName, options } of metadata) this.registerSingleSubscriber({ instance, methodName, options });
  }

  private groupId (): string {
    return this.configService.get<string>('KAFKA_CONSUMER_GROUP_ID') || `${this.clientId}-consumer-group`;
  }

  private consumedTopics (): string[] {
    return Array.from(this.subscribers.keys()).flatMap(topic => [topic, TopicHelper.retryTopic({ topic })]);
  }

  private deadLetterTopics (): string[] {
    return Array.from(this.subscribers.keys()).map(topic => TopicHelper.deadLetterTopic({ topic }));
  }

  private async subscribeToTopics (): Promise<void> {
    if (!this.consumer) return;
    await KafkaHelper.subscribeToTopics({ consumer: this.consumer, topics: this.consumedTopics() });
  }

  private async handleMessage ({ payload }: KafkaMessagePayloadDto): Promise<void> {
    const { topic, partition, message } = payload;
    const originTopic = TopicHelper.originTopic({ topic });
    const handlers = this.subscribers.get(originTopic);
    if (!handlers || handlers.length === 0) return;

    if (TopicHelper.isRetryTopic({ topic })) await RetryHelper.waitUntilDue({ message });

    const record = KafkaHelper.buildKafkaMessage({ topic: originTopic, partition, message });

    await DispatchHelper.runAll({ handlers, record, payload, send: message => this.kafkaService.send(message), consumerGroup: this.groupId(), inboxRepository: this.inboxRepository, logger: this.logger });
  }

  private registerSingleSubscriber ({ instance, methodName, options }: RegisterSubscriberDto): void {
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
    const brokers = KafkaHelper.resolveBrokers({
      brokers: this.configService.get<string>('KAFKA_BROKERS'),
      host: this.configService.get<string>('KAFKA_BROKER_HOST'),
      port: this.configService.get<number>('KAFKA_BROKER_PORT')
    });

    const groupId = this.groupId();
    const kafka = new Kafka(KafkaHelper.createKafkaConfig({ clientId: this.clientId, brokers }));
    this.consumer = kafka.consumer(KafkaHelper.createConsumerConfig({ groupId }));

    await this.consumer.connect();
    await KafkaHelper.ensureKafkaTopicsExist({ kafka, topics: [...this.consumedTopics(), ...this.deadLetterTopics()], logger: this.logger });
    await this.subscribeToTopics();

    try {
      await this.consumer.run({ eachMessage: async (payload: EachMessagePayload): Promise<void> => await this.handleMessage({ payload }) });
      this.logger.log(`Kafka consumer initialized for ${this.clientId} with group: ${groupId}`);
    } catch (error) {
      this.logger.warn(`Kafka consumer group initialization warning: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }
}
