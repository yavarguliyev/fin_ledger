import { Inject, Injectable, InternalServerErrorException, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, logLevel } from 'kafkajs';
import { BaseHelper, ClientIds, KAFKA_CLIENT_ID, UnknownRecord } from '@common/shared-libs';

import { KafkaPublishRecord } from '../interfaces/kafka.interface';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private producer: Producer | null = null;

  constructor (
    @Inject(KAFKA_CLIENT_ID)
    private readonly clientId: ClientIds,
    private readonly configService: ConfigService
  ) {
    this.clientId = clientId;
    this.logger = new Logger(`${KafkaService.name}:${this.clientId}`);
  }

  async onModuleInit (): Promise<void> {
    const brokers = this.resolveBrokers();

    const kafka = new Kafka({
      clientId: this.clientId,
      brokers,
      logLevel: logLevel.ERROR,
      connectionTimeout: 30000,
      requestTimeout: 30000,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = kafka.producer({ maxInFlightRequests: 1, idempotent: true, transactionTimeout: 30000 });
    await this.producer.connect();
    this.logger.log(`Kafka producer initialized for ${this.clientId}`);
  }

  async onModuleDestroy (): Promise<void> {
    await this.producer?.disconnect();
  }

  async publish (payload: UnknownRecord, options: KafkaPublishRecord): Promise<void> {
    if (!this.producer) throw new InternalServerErrorException('Kafka producer not initialized');

    try {
      await this.producer.send({ topic: options.topic, messages: [{ key: options.key ?? null, value: JSON.stringify(payload) }] });
    } catch (error) {
      this.logger.warn(`Kafka publish failed: ${BaseHelper.errorResponse({ error }).message}`);
    }
  }

  private resolveBrokers (): string[] {
    const configured = this.configService.get<string>('KAFKA_BROKERS');
    if (configured) return configured.split(',').map(broker => broker.trim());

    const host = this.configService.get<string>('KAFKA_BROKER_HOST')!;
    const port = this.configService.get<number>('KAFKA_BROKER_PORT')!;

    return [`${host}:${port}`];
  }
}
