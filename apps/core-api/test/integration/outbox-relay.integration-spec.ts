import { setTimeout as sleep } from 'node:timers/promises';
import { Client, Pool } from 'pg';
import { OUTBOX_CONSTANTS, OutboxHelper } from '@common/database';
import { DomainEventType } from '@common/shared-libs';

import { DbHelper } from '../helpers/db.helper';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';

interface ClaimedRow {
  id: string;
}

interface EventRow {
  status: string;
  attempts: number;
  locked_by: string | null;
  delay_seconds: string;
}

const LOCK_SECONDS = 30;
const BATCH_LIMIT = 50;
const MAX_ATTEMPTS = 3;
const PARKED_SECONDS = 3600;
const RELAY_WAIT_MS = 20_000;
const RELAY_POLL_MS = 250;

describe('Outbox relay', () => {
  let aggregateId: string;
  let version = 0;

  const connectionString = (): string => process.env[TEST_ENV_KEYS.DATABASE_URL] as string;

  const seedEvent = async ({ lockedBy, lockOffsetSeconds, availableInSeconds }: { lockedBy?: string; lockOffsetSeconds?: number; availableInSeconds?: number } = {}): Promise<string> => {
    version += 1;

    const [row] = await DbHelper.query<{ id: string }>({
      sql: `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, max_attempts, available_at, locked_by, locked_until)
            VALUES ('WALLET', $1, $2, $3, '{"probe": true}'::jsonb, $4, now() + make_interval(secs => $5),
                    $6, CASE WHEN $7::int IS NULL THEN NULL ELSE now() + make_interval(secs => $7::int) END)
            RETURNING id`,
      params: [aggregateId, DomainEventType.NONE, Date.now() + version, MAX_ATTEMPTS, availableInSeconds ?? PARKED_SECONDS, lockedBy ?? null, lockOffsetSeconds ?? null]
    });

    return row?.id ?? '';
  };

  const waitForStatus = async ({ id, status }: { id: string; status: string }): Promise<string> => {
    const deadline = Date.now() + RELAY_WAIT_MS;
    let current = '';

    while (Date.now() < deadline) {
      current = (await readEvent({ id })).status;
      if (current === status) return current;

      await sleep(RELAY_POLL_MS);
    }

    return current;
  };

  const claim = async ({ pool, lockedBy }: { pool: Pool; lockedBy: string }): Promise<string[]> => {
    const result = await pool.query<ClaimedRow>(OUTBOX_CONSTANTS.CLAIM_PENDING_BATCH_SQL, [lockedBy, LOCK_SECONDS, BATCH_LIMIT]);
    return result.rows.map(row => row.id);
  };

  const claimOwn = async ({ client, ids, lockedBy }: { client: Client; ids: string[]; lockedBy: string }): Promise<string[]> => {
    await client.query('BEGIN');
    await client.query('UPDATE outbox_events SET available_at = now() WHERE id = ANY($1)', [ids]);
    const result = await client.query<ClaimedRow>(OUTBOX_CONSTANTS.CLAIM_PENDING_BATCH_SQL, [lockedBy, LOCK_SECONDS, BATCH_LIMIT]);

    return result.rows.map(row => row.id);
  };

  const reschedule = async ({ id, attempts }: { id: string; attempts: number }): Promise<void> => {
    await DbHelper.query({ sql: OUTBOX_CONSTANTS.RESCHEDULE_FAILED_SQL, params: [id, OutboxHelper.backoffSeconds({ attempts }), 'broker unavailable'] });
  };

  const readEvent = async ({ id }: { id: string }): Promise<EventRow> => {
    const [row] = await DbHelper.query<EventRow>({
      sql: 'SELECT status::text AS status, attempts, locked_by, EXTRACT(EPOCH FROM (available_at - now())) AS delay_seconds FROM outbox_events WHERE id = $1',
      params: [id]
    });

    return row as EventRow;
  };

  beforeAll(async () => {
    const [user] = await DbHelper.query<{ id: string }>({ sql: 'SELECT id FROM users LIMIT 1' });
    aggregateId = user?.id ?? '';
  });

  afterAll(async () => {
    await DbHelper.query({ sql: "UPDATE outbox_events SET status = 'DEAD', locked_by = NULL, locked_until = NULL WHERE payload @> '{\"probe\": true}'::jsonb AND status = 'PENDING'" });
    await DbHelper.close();
  });

  it('never hands the same event to two relays', async () => {
    const seeded = await Promise.all([seedEvent(), seedEvent(), seedEvent(), seedEvent()]);

    const relayA = new Client({ connectionString: connectionString() });
    const relayB = new Pool({ connectionString: connectionString() });
    await relayA.connect();

    try {
      const claimedByA = await claimOwn({ client: relayA, ids: seeded, lockedBy: 'relay-a' });
      expect(seeded.every(id => claimedByA.includes(id))).toBe(true);

      const whileAWorks = await claim({ pool: relayB, lockedBy: 'relay-b' });
      expect(whileAWorks.filter(id => seeded.includes(id))).toEqual([]);

      await relayA.query('COMMIT');

      const afterACommits = await claim({ pool: relayB, lockedBy: 'relay-b' });
      expect(afterACommits.filter(id => seeded.includes(id))).toEqual([]);
    } finally {
      await relayA.end();
      await relayB.end();
    }
  });

  it('keeps a failed event pending with a growing delay, then marks it dead', async () => {
    const id = await seedEvent();
    const delays: number[] = [];

    for (let attempts = 0; attempts < MAX_ATTEMPTS - 1; attempts += 1) {
      await reschedule({ id, attempts });

      const row = await readEvent({ id });
      expect(row).toMatchObject({ status: 'PENDING', attempts: attempts + 1, locked_by: null });
      delays.push(Number(row.delay_seconds));
    }

    expect(delays[1]).toBeGreaterThan(delays[0] as number);

    await reschedule({ id, attempts: MAX_ATTEMPTS - 1 });
    await expect(readEvent({ id })).resolves.toMatchObject({ status: 'DEAD', attempts: MAX_ATTEMPTS });
  });

  it('writes nothing when the transaction that recorded the event rolls back', async () => {
    const client = new Client({ connectionString: connectionString() });
    await client.connect();

    const version = Date.now();

    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, aggregate_version, payload, destination)
         VALUES ('User', $1, $2, $3, '{"probe": true}'::jsonb, 'KAFKA')`,
        [aggregateId, DomainEventType.NONE, version]
      );
      await client.query('ROLLBACK');
    } finally {
      await client.end();
    }

    const rows = await DbHelper.query({
      sql: 'SELECT id FROM outbox_events WHERE aggregate_id = $1 AND aggregate_version = $2',
      params: [aggregateId, version]
    });

    expect(rows).toEqual([]);
  });

  it('publishes an event once its retry delay has passed', async () => {
    const id = await seedEvent({ availableInSeconds: 0 });

    await expect(waitForStatus({ id, status: 'PUBLISHED' })).resolves.toBe('PUBLISHED');
  });

  it('picks up an event whose relay died holding the lock', async () => {
    const abandoned = await seedEvent({ lockedBy: 'crashed-relay', lockOffsetSeconds: -LOCK_SECONDS });
    const held = await seedEvent({ lockedBy: 'live-relay', lockOffsetSeconds: LOCK_SECONDS });

    const relay = new Client({ connectionString: connectionString() });
    await relay.connect();

    try {
      const claimed = await claimOwn({ client: relay, ids: [abandoned, held], lockedBy: 'relay-b' });
      await relay.query('COMMIT');

      expect(claimed).toContain(abandoned);
      expect(claimed).not.toContain(held);
    } finally {
      await relay.end();
    }
  });
});
