import { z } from 'zod';

import { EventPayloadCheckDto } from '../dtos/event-payload-check.dto';
import { EVENT_CONTRACTS } from '../events/event-contracts.contract';
import { EventContract } from '../interfaces/event-contract.interface';

export class EventContractHelper {
  static violation ({ eventType, payload }: EventPayloadCheckDto): string | null {
    const contract: EventContract | undefined = EVENT_CONTRACTS[eventType];
    if (!contract) return null;

    const result = contract.schema.safeParse(payload);
    return result.success ? null : `${eventType} v${contract.version}: ${z.prettifyError(result.error)}`;
  }
}
