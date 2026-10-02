import { randomUUID } from 'node:crypto';

import { MONEY_AUDIT_TEST as T } from '../constants/money-audit.constant';
import { AuditLogHelper } from '../helpers/audit-log.helper';
import { DbHelper } from '../helpers/db.helper';

describe('Auditing money movement from the outbox', () => {
  afterAll(async () => DbHelper.close());

  it.each(T.CASES)('writes $action to audit_log when the $topic event is relayed', async ({ aggregateType, topic, action, idKey }) => {
    const entityId = randomUUID();
    const payload = { [idKey]: entityId, amountMinor: T.AMOUNT_MINOR, currency: T.CURRENCY };

    await DbHelper.query({ sql: T.INSERT_SQL, params: [aggregateType, entityId, topic, Date.now(), JSON.stringify(payload)] });

    await expect(AuditLogHelper.waitFor({ entityId, action })).resolves.toEqual({ action, entity_type: aggregateType, entity_id: entityId });
  });
});
