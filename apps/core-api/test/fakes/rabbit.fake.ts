import type { ChannelModel } from 'amqplib';

import { ServiceRef } from '../interfaces/rabbit-probe.interface';

export const connectionOf = ({ target }: ServiceRef): ChannelModel => (target as unknown as { connection: ChannelModel }).connection;
