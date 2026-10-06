import { Injectable, InternalServerErrorException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ChannelModel, ConfirmChannel, ConsumeMessage } from 'amqplib';
import { ServiceClientDto, BaseHelper } from '@common/shared-libs';
import { BaseMessageBroker, BrokerSubscribeDto, QueueNameDto, ReplayDeadLettersDto } from '@common/messaging';

import { RabbitmqPublishDto } from '../dtos/service/rabbitmq-publish.dto';
import { ConsumedMessageDto } from '../dtos/step/consumed-message.dto';
import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { RABBITMQ_TOPOLOGY } from '../constants/messaging/topology.constant';
import { ConnectionHelper } from '../helpers/connection.helper';
import { ConsumeHelper } from '../helpers/consume.helper';
import { PublishHelper } from '../helpers/publish.helper';
import { ReplayHelper } from '../helpers/replay.helper';
import { ShutdownHelper } from '../helpers/shutdown.helper';
import { TopologyHelper } from '../helpers/topology.helper';

@Injectable()
export class RabbitmqService extends BaseMessageBroker implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private readonly consumerTags = new Map<string, string>();
  private reconnectAttempt = 0;

  constructor ({ configService, clientId }: ServiceClientDto) {
    super({ configService, ...(clientId && { clientId }) });
  }

  async onModuleInit (): Promise<void> {
    await this.connect();
    this.logger.log(`RabbitMQ service initialized for ${this.clientId}`);
  }

  async onModuleDestroy (): Promise<void> {
    this.stopped = true;

    const channel = this.channel;

    if (channel) {
      await ShutdownHelper.cancelConsumers({ channel, consumerTags: [...this.consumerTags.values()], logger: this.logger });
      await this.drain();
    }

    await ShutdownHelper.close({ channel: this.channel, connection: this.connection, logger: this.logger });

    this.consumerTags.clear();
    this.channel = null;
    this.connection = null;
  }

  async publish ({ payload, routingKey, exchange, persistent, headers }: RabbitmqPublishDto): Promise<void> {
    await PublishHelper.confirmed({
      channel: this.requireChannel(),
      exchange: exchange ?? RABBITMQ_CONSTANTS.RABBITMQ_EXCHANGE.key,
      routingKey,
      content: Buffer.from(JSON.stringify(payload)),
      persistent: persistent ?? true,
      ...(headers && { headers })
    });
  }

  async queueDepth ({ queue }: QueueNameDto): Promise<number> {
    const { messageCount } = await this.requireChannel().checkQueue(queue);
    return messageCount;
  }

  protected async cancel ({ queue }: QueueNameDto): Promise<void> {
    const consumerTag = this.consumerTags.get(queue);
    this.consumerTags.delete(queue);
    if (consumerTag && this.channel) await ShutdownHelper.cancelConsumers({ channel: this.channel, consumerTags: [consumerTag], logger: this.logger });
  }

  async replayDeadLetters ({ queue, limit }: ReplayDeadLettersDto): Promise<number> {
    return ReplayHelper.replay({ channel: this.requireChannel(), queue, limit: limit ?? RABBITMQ_TOPOLOGY.REPLAY_DEFAULT_LIMIT, logger: this.logger });
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
      this.consumerTags.clear();

      for (const subscription of this.subscriptions) await this.consume(subscription);

      this.logger.log(`RabbitMQ reconnected and ${this.subscriptions.length} subscription(s) restored`);
    } catch (error) {
      this.logger.error(`RabbitMQ reconnect failed: ${BaseHelper.errorResponse({ error }).message}`);
      void this.reconnect();
    }
  }

  protected async consume ({ queue, routingKey, handler, inbox }: BrokerSubscribeDto): Promise<void> {
    const channel = this.requireChannel();

    await TopologyHelper.assertConsumerTopology({ channel, queue, routingKey });

    const { consumerTag } = await channel.consume(queue, (message: ConsumeMessage | null) => {
      const deliver = ({ payload, eventId }: ConsumedMessageDto): Promise<void> =>
        this.deliver({ queue, payload, handler, ...(eventId && { eventId }), ...(inbox && { inbox }) });

      void this.track(ConsumeHelper.handle({ channel, queue, message, deliver, logger: this.logger }));
    });

    this.consumerTags.set(queue, consumerTag);
  }

  private requireChannel (): ConfirmChannel {
    if (!this.channel) throw new InternalServerErrorException('RabbitMQ channel not initialized');
    return this.channel;
  }
}
