import { OUTBOX_PROBE as O } from '../constants/outbox-probe.constant';
import { OutboxProbe } from '../helpers/outbox-probe.helper';

describe('Outbox relay claims', () => {
  const probe = OutboxProbe.useInSuite();

  it('never hands the same event to two relays', async () => {
    const seeded = await Promise.all([probe().seed(), probe().seed(), probe().seed(), probe().seed()]);
    const relayA = OutboxProbe.client();
    const relayB = OutboxProbe.pool();
    await relayA.connect();

    try {
      const claimedByA = await OutboxProbe.claimOwn({ client: relayA, ids: seeded, lockedBy: O.RELAY_A });
      expect(seeded.every(id => claimedByA.includes(id))).toBe(true);

      const whileAWorks = await OutboxProbe.claim({ pool: relayB, lockedBy: O.RELAY_B });
      expect(whileAWorks.filter(id => seeded.includes(id))).toEqual([]);

      await relayA.query(O.COMMIT);
      const afterACommits = await OutboxProbe.claim({ pool: relayB, lockedBy: O.RELAY_B });
      expect(afterACommits.filter(id => seeded.includes(id))).toEqual([]);
    } finally {
      await relayA.end();
      await relayB.end();
    }
  });

  it('picks up an event whose relay died holding the lock', async () => {
    const abandoned = await probe().seed({ lockedBy: O.CRASHED_RELAY, lockOffsetSeconds: -O.LOCK_SECONDS });
    const held = await probe().seed({ lockedBy: O.LIVE_RELAY, lockOffsetSeconds: O.LOCK_SECONDS });
    const relay = OutboxProbe.client();
    await relay.connect();

    try {
      const claimed = await OutboxProbe.claimOwn({ client: relay, ids: [abandoned, held], lockedBy: O.RELAY_B });
      await relay.query(O.COMMIT);

      expect(claimed).toContain(abandoned);
      expect(claimed).not.toContain(held);
    } finally {
      await relay.end();
    }
  });
});
