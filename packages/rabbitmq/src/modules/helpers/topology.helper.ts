import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { RABBITMQ_TOPOLOGY } from '../constants/messaging/topology.constant';
import { AssertTopologyDto } from '../dtos/topology/assert-topology.dto';
import { QueueHelper } from './queue.helper';

export class TopologyHelper {
  static async assertConsumerTopology ({ channel, queue, routingKey }: AssertTopologyDto): Promise<void> {
    const deadLetterQueue = QueueHelper.deadLetterQueue({ queue });

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, RABBITMQ_CONSTANTS.RABBITMQ_EXCHANGE.key, routingKey);
    await channel.bindQueue(queue, RABBITMQ_CONSTANTS.RABBITMQ_DLX_EXCHANGE.key, queue);

    for (let attempt = 1; attempt <= RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length; attempt += 1) {
      const retryQueue = QueueHelper.retryQueue({ queue, attempt });

      await channel.assertQueue(retryQueue, {
        durable: true,
        messageTtl: QueueHelper.retryDelay({ attempt }),
        deadLetterExchange: RABBITMQ_CONSTANTS.RABBITMQ_DLX_EXCHANGE.key,
        deadLetterRoutingKey: queue
      });

      await channel.bindQueue(retryQueue, RABBITMQ_CONSTANTS.RABBITMQ_DLX_EXCHANGE.key, retryQueue);
    }

    await channel.assertQueue(deadLetterQueue, { durable: true });
    await channel.bindQueue(deadLetterQueue, RABBITMQ_CONSTANTS.RABBITMQ_DLX_EXCHANGE.key, deadLetterQueue);
  }
}
