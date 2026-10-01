import { RABBITMQ_CONSTANTS } from '../constants/messaging/rabbitmq.constant';
import { RABBITMQ_TOPOLOGY } from '../constants/messaging/topology.constant';
import { ReplayBatchDto } from '../dtos/step/replay-batch.dto';
import { PublishHelper } from './publish.helper';
import { QueueHelper } from './queue.helper';
import { SettleHelper } from './settle.helper';

export class ReplayHelper {
  static async replay ({ channel, queue, limit, logger }: ReplayBatchDto): Promise<number> {
    const source = QueueHelper.deadLetterQueue({ queue });

    let moved = 0;

    while (moved < limit) {
      const message = await channel.get(source, { noAck: false });
      if (!message) break;

      await PublishHelper.confirmed({
        channel,
        exchange: RABBITMQ_CONSTANTS.RABBITMQ_DLX_EXCHANGE.key,
        routingKey: queue,
        content: message.content,
        persistent: true,
        headers: { ...message.properties.headers, [RABBITMQ_TOPOLOGY.ATTEMPTS_HEADER]: 0 }
      });

      SettleHelper.settle({ channel, message, requeue: false, logger });
      moved += 1;
    }

    logger.log(`Replayed ${moved} message(s) from ${source} into ${queue}`);

    return moved;
  }
}
