import { EVENT_ENVELOPE } from '@common/contracts';

import { EnvelopeHeadersDto } from '../dtos/outbox/envelope-headers.dto';

export class EnvelopeHelper {
  static headers ({ eventId, eventType, occurredAt, correlationId }: EnvelopeHeadersDto): Record<string, string> {
    const { HEADERS } = EVENT_ENVELOPE;
    return {
      [HEADERS.TYPE]: eventType,
      [HEADERS.VERSION]: String(EVENT_ENVELOPE.CURRENT_VERSION),
      [HEADERS.ID]: eventId,
      [HEADERS.OCCURRED_AT]: new Date(occurredAt).toISOString(),
      ...(correlationId && { [HEADERS.CORRELATION_ID]: correlationId })
    };
  }
}
