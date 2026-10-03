import { setTimeout as sleep } from 'node:timers/promises';
import { Client, Pool } from 'pg';
import { OUTBOX_CONSTANTS, OutboxHelper } from '@common/database';
import { DomainEventType } from '@common/shared-libs';

import { DbHelper } from './db.helper';
import { OUTBOX_PROBE as O } from '../constants/outbox-probe.constant';
import { TEST_ENV_KEYS } from '../constants/test-env-keys.constant';
import {
  ClaimedRow,
  OutboxClientClaim,
  OutboxEventRef,
  OutboxEventRow,
  OutboxPoolClaim,
  OutboxReschedule,
  OutboxStatusWait,
  SeedOutboxEvent
} from '../interfaces/outbox-probe.interface';

export class OutboxProbe {
  private version = 0;
  aggregateId = '';

  static useInSuite (): () => OutboxProbe {
    const probe = new OutboxProbe();
    beforeAll(async () => {
      const [user] = await DbHelper.query<ClaimedRow>({ sql: O.ANY_USER_SQL });
      probe.aggregateId = user?.id ?? '';
    });
    afterAll(async () => {
      await DbHelper.query({ sql: O.CLEANUP_SQL });
      await DbHelper.close();
    });
    return () => probe;
  }

  static client (): Client {
    return new Client({ connectionString: process.env[TEST_ENV_KEYS.DATABASE_URL] as string });
  }

  static pool (): Pool {
    return new Pool({ connectionString: process.env[TEST_ENV_KEYS.DATABASE_URL] as string });
  }

  async seed ({ lockedBy, lockOffsetSeconds, availableInSeconds }: SeedOutboxEvent = {}): Promise<string> {
    this.version += 1;
    const [row] = await DbHelper.query<ClaimedRow>({
      sql: O.SEED_SQL,
      params: [
        this.aggregateId,
        DomainEventType.NONE,
        Date.now() + this.version,
        O.MAX_ATTEMPTS,
        availableInSeconds ?? O.PARKED_SECONDS,
        lockedBy ?? null,
        lockOffsetSeconds ?? null
      ]
    });
    return row?.id ?? '';
  }

  static async read ({ id }: OutboxEventRef): Promise<OutboxEventRow> {
    const [row] = await DbHelper.query<OutboxEventRow>({ sql: O.READ_SQL, params: [id] });
    return row as OutboxEventRow;
  }

  static async waitForStatus ({ id, status }: OutboxStatusWait): Promise<string> {
    const deadline = Date.now() + O.RELAY_WAIT_MS;
    let current = '';
    while (Date.now() < deadline) {
      current = (await OutboxProbe.read({ id })).status;
      if (current === status) return current;
      await sleep(O.RELAY_POLL_MS);
    }
    return current;
  }

  static async claim ({ pool, lockedBy }: OutboxPoolClaim): Promise<string[]> {
    const result = await pool.query<ClaimedRow>(OUTBOX_CONSTANTS.CLAIM_PENDING_BATCH_SQL, [lockedBy, O.LOCK_SECONDS, O.BATCH_LIMIT]);
    return result.rows.map(row => row.id);
  }

  static async claimOwn ({ client, ids, lockedBy }: OutboxClientClaim): Promise<string[]> {
    await client.query(O.BEGIN);
    await client.query(O.MAKE_DUE_SQL, [ids]);
    const result = await client.query<ClaimedRow>(OUTBOX_CONSTANTS.CLAIM_PENDING_BATCH_SQL, [lockedBy, O.LOCK_SECONDS, O.BATCH_LIMIT]);
    return result.rows.map(row => row.id);
  }

  static async reschedule ({ id, attempts }: OutboxReschedule): Promise<void> {
    await DbHelper.query({ sql: OUTBOX_CONSTANTS.RESCHEDULE_FAILED_SQL, params: [id, OutboxHelper.backoffSeconds({ attempts }), O.FAILURE] });
  }
}
