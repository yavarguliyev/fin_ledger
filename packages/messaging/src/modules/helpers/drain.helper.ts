import { setTimeout as sleep } from 'node:timers/promises';

import { BROKER_CONSTANTS } from '../constants/messaging/broker.constant';
import { DrainDto } from '../dtos/drain/drain.dto';

export class DrainHelper {
  static async drain ({ pending, logger }: DrainDto): Promise<void> {
    const deadline = Date.now() + BROKER_CONSTANTS.DRAIN_TIMEOUT_MS;
    while (pending() > 0 && Date.now() < deadline) await sleep(BROKER_CONSTANTS.DRAIN_POLL_MS);
    if (pending() > 0) logger.warn(`Closing with ${pending()} message(s) still in flight; they will be redelivered`);
  }
}
