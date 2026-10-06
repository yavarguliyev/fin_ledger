import { OUTBOX_DRAIN_TEST } from '../constants/outbox-drain.constant';
import { OUTBOX_SETTINGS_TEST } from '../constants/outbox-settings.constant';
import { OutboxPublisherService } from '../../src/modules/services/outbox-publisher.service';

interface FakeEvent {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  attempts: number;
  destination: string;
  createdAt: Date;
}

const batchOf = (size: number): FakeEvent[] =>
  Array.from({ length: size }, (_, index) => ({
    id: `event-${index}`,
    eventType: OUTBOX_DRAIN_TEST.EVENT_TYPE,
    payload: {},
    attempts: 0,
    destination: OUTBOX_DRAIN_TEST.KAFKA,
    createdAt: new Date()
  }));

describe('OutboxPublisherService draining', () => {
  it('keeps claiming batches while they come back full, then stops at the first partial batch', async () => {
    const batches = [
      ...Array.from({ length: OUTBOX_DRAIN_TEST.FULL_BATCHES }, () => batchOf(OUTBOX_DRAIN_TEST.BATCH_SIZE)),
      batchOf(OUTBOX_DRAIN_TEST.LAST_BATCH)
    ];
    const claimPendingBatch = jest.fn().mockImplementation(() => Promise.resolve(batches.shift() ?? []));
    const repository = { claimPendingBatch, markPublished: jest.fn().mockResolvedValue(undefined), rescheduleFailed: jest.fn() };
    const kafka = { send: jest.fn().mockResolvedValue(undefined) };
    const service = new OutboxPublisherService(repository as never, {} as never, kafka as never);

    await service[OUTBOX_DRAIN_TEST.RELAY_POLL]();

    expect(claimPendingBatch).toHaveBeenCalledTimes(OUTBOX_DRAIN_TEST.FULL_BATCHES + 1);
    expect(kafka.send).toHaveBeenCalledTimes(OUTBOX_DRAIN_TEST.FULL_BATCHES * OUTBOX_DRAIN_TEST.BATCH_SIZE + OUTBOX_DRAIN_TEST.LAST_BATCH);
  });

  it('drains with the configured batch size instead of the default', async () => {
    const batches = [
      ...Array.from({ length: OUTBOX_SETTINGS_TEST.FULL_BATCHES }, () => batchOf(OUTBOX_SETTINGS_TEST.SMALL_BATCH)),
      batchOf(OUTBOX_SETTINGS_TEST.LAST_BATCH)
    ];
    const claimPendingBatch = jest.fn().mockImplementation(() => Promise.resolve(batches.shift() ?? []));
    const repository = { claimPendingBatch, markPublished: jest.fn().mockResolvedValue(undefined), rescheduleFailed: jest.fn() };
    const config = { get: (key: string): number | undefined => (key === OUTBOX_SETTINGS_TEST.BATCH_KEY ? OUTBOX_SETTINGS_TEST.SMALL_BATCH : undefined) };
    const service = new OutboxPublisherService(repository as never, {} as never, { send: jest.fn() } as never, config as never);

    await service[OUTBOX_DRAIN_TEST.RELAY_POLL]();

    expect(claimPendingBatch).toHaveBeenCalledTimes(OUTBOX_SETTINGS_TEST.FULL_BATCHES + 1);
    expect(claimPendingBatch).toHaveBeenCalledWith(expect.objectContaining({ limit: OUTBOX_SETTINGS_TEST.SMALL_BATCH }));
  });
});
