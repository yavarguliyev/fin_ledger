import { OutboxBackoffDto } from '../../dtos/outbox/outbox-backoff.dto';
import { OUTBOX_CONSTANTS } from '../../constants/outbox/outbox.constant';

export class OutboxHelper {
  static backoffSeconds ({ attempts }: OutboxBackoffDto): number {
    return Math.min(OUTBOX_CONSTANTS.BACKOFF_BASE_SECONDS * 2 ** attempts, OUTBOX_CONSTANTS.BACKOFF_MAX_SECONDS);
  }
}
