import amqp from 'amqplib';

import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { RABBITMQ_TOPOLOGY } from '../constants/messaging/topology.constant';
import { AttemptDto } from '../dtos/topology/attempt.dto';
import { ConnectionConfigDto } from '../dtos/topology/connection-config.dto';
import { ConnectionUrlDto } from '../dtos/topology/connection-url.dto';
import { OpenConnection } from '../interfaces/open-connection.interface';

export class ConnectionHelper {
  static async open ({ url }: ConnectionUrlDto): Promise<OpenConnection> {
    const connection = await amqp.connect(url);
    const channel = await connection.createConfirmChannel();

    await channel.assertExchange(RABBITMQ_CONSTANTS.RABBITMQ_EXCHANGE.key, 'topic', { durable: true });
    await channel.assertExchange(RABBITMQ_CONSTANTS.RABBITMQ_DLX_EXCHANGE.key, 'topic', { durable: true });
    await channel.prefetch(RABBITMQ_TOPOLOGY.PREFETCH);

    return { connection, channel };
  }

  static resolveUrl ({ configService }: ConnectionConfigDto): string {
    const configuredUrl = configService.get<string>('RABBITMQ_URL');
    if (configuredUrl) return configuredUrl;

    const user = configService.get<string>('RABBITMQ_DEFAULT_USER')!;
    const pass = configService.get<string>('RABBITMQ_DEFAULT_PASS')!;
    const host = configService.get<string>('RABBITMQ_DEFAULT_HOST')!;

    return `amqp://${user}:${pass}@${host}:5672`;
  }

  static backoffMs ({ attempt }: AttemptDto): number {
    return Math.min(RABBITMQ_TOPOLOGY.RECONNECT_BASE_MS * 2 ** (attempt - 1), RABBITMQ_TOPOLOGY.RECONNECT_MAX_MS);
  }
}
