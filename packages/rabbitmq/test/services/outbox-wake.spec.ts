import { OutboxPublisherService } from '../../src/modules/services/outbox-publisher.service';
import { OUTBOX_WAKE_TEST as T } from '../constants/outbox-wake.constant';

const flush = (): Promise<void> => new Promise(resolve => setImmediate(resolve));

describe('OutboxPublisherService wake-up', () => {
  it('polls straight away when woken while idle', async () => {
    const claimPendingBatch = jest.fn().mockResolvedValue([]);
    const service = new OutboxPublisherService({ claimPendingBatch } as never, {} as never, {} as never);

    service.wake();
    await flush();

    expect(claimPendingBatch).toHaveBeenCalledTimes(1);
  });

  it('polls once more when woken during a poll, so an event inserted mid-poll is not left waiting', async () => {
    let release: (value: unknown[]) => void = () => undefined;
    const claimPendingBatch = jest
      .fn()
      .mockImplementationOnce(() => new Promise<unknown[]>(resolve => (release = resolve)))
      .mockResolvedValue([]);
    const service = new OutboxPublisherService({ claimPendingBatch } as never, {} as never, {} as never);

    service.wake();
    await flush();
    service.wake();
    service.wake();
    release([]);
    for (let tick = 0; tick < T.TICKS; tick += 1) await flush();

    expect(claimPendingBatch).toHaveBeenCalledTimes(T.EXPECTED_CLAIMS);
  });
});
