import { RABBITMQ_TOPOLOGY } from '../constants/messaging/topology.constant';
import { QueueNameDto } from '../dtos/topology/queue-name.dto';
import { RetryQueueDto } from '../dtos/topology/retry-queue.dto';
import { AttemptDto } from '../dtos/topology/attempt.dto';

export class QueueHelper {
  static retryQueue ({ queue, attempt }: RetryQueueDto): string {
    return `${queue}.${RABBITMQ_TOPOLOGY.RETRY_SUFFIX}.${attempt}`;
  }

  static deadLetterQueue ({ queue }: QueueNameDto): string {
    return `${queue}.${RABBITMQ_TOPOLOGY.DLQ_SUFFIX}`;
  }

  static retryDelay ({ attempt }: AttemptDto): number {
    return RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS[attempt - 1] ?? RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS[RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length - 1]!;
  }

  static isExhausted ({ attempt }: AttemptDto): boolean {
    return attempt > RABBITMQ_TOPOLOGY.RETRY_DELAYS_MS.length;
  }
}
