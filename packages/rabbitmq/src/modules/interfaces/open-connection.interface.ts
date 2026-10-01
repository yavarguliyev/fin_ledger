import type { ChannelModel, ConfirmChannel } from 'amqplib';

export interface OpenConnection {
  readonly connection: ChannelModel;
  readonly channel: ConfirmChannel;
}
