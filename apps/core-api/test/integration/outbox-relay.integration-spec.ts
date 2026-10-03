import { DomainEventType } from '@common/shared-libs';

import { DbHelper } from '../helpers/db.helper';
import { OUTBOX_PROBE as O } from '../constants/outbox-probe.constant';
import { OutboxProbe } from '../helpers/outbox-probe.helper';

describe('Outbox relay', () => {
  const probe = OutboxProbe.useInSuite();

  it('keeps a failed event pending with a growing delay, then marks it dead', async () => {
    const id = await probe().seed();
    const delays: number[] = [];

    for (let attempts = 0; attempts < O.MAX_ATTEMPTS - 1; attempts += 1) {
      await OutboxProbe.reschedule({ id, attempts });
      const row = await OutboxProbe.read({ id });
      expect(row).toMatchObject({ status: O.PENDING, attempts: attempts + 1, locked_by: null });
      delays.push(Number(row.delay_seconds));
    }

    expect(delays[1]).toBeGreaterThan(delays[0] as number);
    await OutboxProbe.reschedule({ id, attempts: O.MAX_ATTEMPTS - 1 });
    await expect(OutboxProbe.read({ id })).resolves.toMatchObject({ status: O.DEAD, attempts: O.MAX_ATTEMPTS });
  });

  it('writes nothing when the transaction that recorded the event rolls back', async () => {
    const client = OutboxProbe.client();
    const version = Date.now();
    await client.connect();

    try {
      await client.query(O.BEGIN);
      await client.query(O.ROLLED_BACK_INSERT_SQL, [probe().aggregateId, DomainEventType.NONE, version]);
      await client.query(O.ROLLBACK);
    } finally {
      await client.end();
    }

    await expect(DbHelper.query({ sql: O.FIND_VERSION_SQL, params: [probe().aggregateId, version] })).resolves.toEqual([]);
  });

  it('publishes an event once its retry delay has passed', async () => {
    const id = await probe().seed({ availableInSeconds: 0 });

    await expect(OutboxProbe.waitForStatus({ id, status: O.PUBLISHED })).resolves.toBe(O.PUBLISHED);
  });
});
