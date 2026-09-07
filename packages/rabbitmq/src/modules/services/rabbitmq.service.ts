import { Injectable, InternalServerErrorException, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { errorResponse, ClientIds, UnknownRecord, HandleRecord } from '@common/shared-libs';

import { RabbitmqPublishOptions } from '../interfaces/queue.interface';
import { RABBITMQ_CONSTANTS } from '../constants/rabbitmq.constant';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly clientId: ClientIds;
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor (
    private readonly configService: ConfigService,
    clientId?: ClientIds
  ) {
    this.clientId = clientId || ClientIds.DEAFULT;
    this.logger = new Logger(`${RabbitmqService.name}:${this.clientId}`);
  }

  async onModuleInit (): Promise<void> {
    const url = this.resolveConnectionUrl();
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(RABBITMQ_CONSTANTS.RABBITMQ_EXCHANGE.key, 'topic', { durable: true });
    await this.channel.assertExchange(RABBITMQ_CONSTANTS.RABBITMQ_DLX_EXCHANGE.key, 'topic', { durable: true });
    this.logger.log(`RabbitMQ service initialized for ${this.clientId}`);
  }

  async onModuleDestroy (): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish (payload: UnknownRecord, options: RabbitmqPublishOptions): Promise<void> {
    if (!this.channel) throw new InternalServerErrorException('RabbitMQ channel not initialized');
    const exchange = options.exchange ?? RABBITMQ_CONSTANTS.RABBITMQ_EXCHANGE.key;
    const buffer = Buffer.from(JSON.stringify(payload));
    this.channel.publish(exchange, options.routingKey, buffer, { persistent: options.persistent ?? true });
    await Promise.resolve();
  }

  async subscribe (routingKey: string, handler: HandleRecord): Promise<void> {
    if (!this.channel) throw new InternalServerErrorException('RabbitMQ channel not initialized');
    const queue = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue.queue, RABBITMQ_CONSTANTS.RABBITMQ_EXCHANGE.key, routingKey);
    await this.channel.consume(queue.queue, (message: ConsumeMessage | null) => {
      void this.handleMessage(message, handler);
    });
  }

  private async handleMessage (message: ConsumeMessage | null, handler: HandleRecord): Promise<void> {
    if (!message || !this.channel) return;

    try {
      const payload = JSON.parse(message.content.toString()) as UnknownRecord;
      await handler(payload);
      this.channel.ack(message);
    } catch (error) {
      this.logger.warn(`RabbitMQ handler failed: ${errorResponse(error).message}`);
      this.channel.nack(message, false, false);
    }
  }

  private resolveConnectionUrl (): string {
    const configuredUrl = this.configService.get<string>('RABBITMQ_URL');
    if (configuredUrl) return configuredUrl;
    const user = this.configService.get<string>('RABBITMQ_DEFAULT_USER')!;
    const pass = this.configService.get<string>('RABBITMQ_DEFAULT_PASS')!;
    const host = this.configService.get<string>('RABBITMQ_DEFAULT_HOST')!;
    return `amqp://${user}:${pass}@${host}:5672`;
  }
}
