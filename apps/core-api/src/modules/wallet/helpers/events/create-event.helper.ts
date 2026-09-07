import { CreateEventDto } from '../../../analytics/dtos/analytics-event.dto';

export const createEvent = async ({ eventPayload, aggregateType, eventType, outboxRepository, tx }: CreateEventDto): Promise<void> => {
  await outboxRepository.createEvent({ aggregateType, aggregateId: eventPayload.walletId, eventType, payload: eventPayload }, tx);
};
