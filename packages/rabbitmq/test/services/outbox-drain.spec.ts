import { OUTBOX_DRAIN_TEST } from '../constants/outbox-drain.constant';
import { OutboxPublisherService } from '../../src/modules/services/outbox-publisher.service';

interface FakeEvent {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  attempts: number;
  destination: string;
}

interface Relay {
  poll: () => Promise<void>;
}

const batchOf = (size: number): FakeEvent[] =>
  Array.from({ length: size }, (_, index) => ({
    id: `event-${index}`,
    eventType: OUTBOX_DRAIN_TEST.EVENT_TYPE,
    payload: {},
    attempts: 0,
    destination: OUTBOX_DRAIN_TEST.KAFKA
  }));

describe('OutboxPublisherService draining', () => {
  it('keeps claiming batches while they come back full, then stops at the first partial batch', async () => {
    const batches = [
      ...Array.from({ length: OUTBOX_DRAIN_TEST.FULL_BATCHES }, () => batchOf(OUTBOX_DRAIN_TEST.BATCH_SIZE)),
      batchOf(OUTBOX_DRAIN_TEST.LAST_BATCH)
    ];
    const claimPendingBatch = jest.fn().mockImplementation(async () => batches.shift() ?? []);
    const repository = { claimPendingBatch, markPublished: jest.fn().mockResolvedValue(undefined), rescheduleFailed: jest.fn() };
    const kafka = { send: jest.fn().mockResolvedValue(undefined) };
    const service = new OutboxPublisherService(repository as never, {} as never, kafka as never);

    await (service as unknown as Relay)[OUTBOX_DRAIN_TEST.RELAY_POLL]();

    expect(claimPendingBatch).toHaveBeenCalledTimes(OUTBOX_DRAIN_TEST.FULL_BATCHES + 1);
    expect(kafka.send).toHaveBeenCalledTimes(OUTBOX_DRAIN_TEST.FULL_BATCHES * OUTBOX_DRAIN_TEST.BATCH_SIZE + OUTBOX_DRAIN_TEST.LAST_BATCH);
  });
});
