import { Injectable, InternalServerErrorException, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelModel, ConfirmChannel, ConsumeMessage } from 'amqplib';
import { ClientIds, ServiceClientDto, BaseHelper } from '@common/shared-libs';

import { RabbitmqPublishDto } from '../dtos/service/rabbitmq-publish.dto';
import { RabbitmqSubscribeDto } from '../dtos/service/rabbitmq-subscribe.dto';
import { QueueNameDto } from '../dtos/topology/queue-name.dto';
import { ReplayDeadLettersDto } from '../dtos/topology/replay-dead-letters.dto';
import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { RABBITMQ_TOPOLOGY } from '../constants/messaging/topology.constant';
import { ConnectionHelper } from '../helpers/connection.helper';
import { ConsumeHelper } from '../helpers/consume.helper';
import { PublishHelper } from '../helpers/publish.helper';
import { ReplayHelper } from '../helpers/replay.helper';
import { ShutdownHelper } from '../helpers/shutdown.helper';
import { TopologyHelper } from '../helpers/topology.helper';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;
  private readonly clientId: ClientIds;
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private readonly subscriptions: RabbitmqSubscribeDto[] = [];
  private consumerTags: string[] = [];
  private inFlight = 0;
  private stopped = false;
  private reconnectAttempt = 0;

  private readonly configService: ConfigService;

  constructor ({ configService, clientId }: ServiceClientDto) {
    this.configService = configService;
    this.clientId = clientId || ClientIds.DEFAULT;
    this.logger = new Logger(`${RabbitmqService.name}:${this.clientId}`);
  }

  async onModuleInit (): Promise<void> {
    await this.connect();
    this.logger.log(`RabbitMQ service initialized for ${this.clientId}`);
  }

  async onModuleDestroy (): Promise<void> {
    this.stopped = true;

    const channel = this.channel;

    if (channel) {
      await ShutdownHelper.cancelConsumers({ channel, consumerTags: this.consumerTags, logger: this.logger });
      await ShutdownHelper.drain({ pending: () => this.inFlight, logger: this.logger });
    }

    await ShutdownHelper.close({ channel: this.channel, connection: this.connection, logger: this.logger });

    this.consumerTags = [];
    this.channel = null;
    this.connection = null;
  }

  async publish ({ payload, routingKey, exchange, persistent }: RabbitmqPublishDto): Promise<void> {
    await PublishHelper.confirmed({
      channel: this.requireChannel(),
      exchange: exchange ?? RABBITMQ_CONSTANTS.RABBITMQ_EXCHANGE.key,
      routingKey,
      content: Buffer.from(JSON.stringify(payload)),
      persistent: persistent ?? true
    });
  }

  async subscribe ({ queue, routingKey, handler }: RabbitmqSubscribeDto): Promise<void> {
    this.subscriptions.push({ queue, routingKey, handler });
    await this.consumeQueue({ queue, routingKey, handler });
  }

  async queueDepth ({ queue }: QueueNameDto): Promise<number> {
    const { messageCount } = await this.requireChannel().checkQueue(queue);
    return messageCount;
  }

  async replayDeadLetters ({ queue, limit }: ReplayDeadLettersDto): Promise<number> {
    return ReplayHelper.replay({
      channel: this.requireChannel(),
      queue,
      limit: limit ?? RABBITMQ_TOPOLOGY.REPLAY_DEFAULT_LIMIT,
      logger: this.logger
    });
  }

  private async connect (): Promise<void> {
    const { connection, channel } = await ConnectionHelper.open({ url: ConnectionHelper.resolveUrl({ configService: this.configService }) });

    connection.on('error', () => undefined);
    connection.on('close', () => void this.reconnect());

    this.connection = connection;
    this.channel = channel;
    this.reconnectAttempt = 0;
  }

  private async reconnect (): Promise<void> {
    if (this.stopped) return;

    this.channel = null;
    this.connection = null;
    this.reconnectAttempt += 1;

    const delay = ConnectionHelper.backoffMs({ attempt: this.reconnectAttempt });
    this.logger.warn(`RabbitMQ connection lost, reconnecting in ${delay}ms (attempt ${this.reconnectAttempt})`);

    await new Promise<void>(resolve => setTimeout(resolve, delay).unref());
    if (this.stopped) return;

    try {
      await this.connect();
      this.consumerTags = [];

      for (const subscription of this.subscriptions) await this.consumeQueue(subscription);

      this.logger.log(`RabbitMQ reconnected and ${this.subscriptions.length} subscription(s) restored`);
    } catch (error) {
      this.logger.error(`RabbitMQ reconnect failed: ${BaseHelper.errorResponse({ error }).message}`);
      void this.reconnect();
    }
  }

  private async consumeQueue ({ queue, routingKey, handler }: RabbitmqSubscribeDto): Promise<void> {
    const channel = this.requireChannel();

    await TopologyHelper.assertConsumerTopology({ channel, queue, routingKey });

    const { consumerTag } = await channel.consume(queue, (message: ConsumeMessage | null) => {
      this.inFlight += 1;
      void ConsumeHelper.handle({ channel, queue, message, handler, logger: this.logger }).finally(() => {
        this.inFlight -= 1;
      });
    });

    this.consumerTags.push(consumerTag);
  }

  private requireChannel (): ConfirmChannel {
    if (!this.channel) throw new InternalServerErrorException('RabbitMQ channel not initialized');
    return this.channel;
  }
}
