import { setTimeout as delay } from 'node:timers/promises';

import { DbHelper } from './db.helper';
import { AUDIT_LOG_TEST } from '../constants/audit-log.constant';
import { AuditRow } from '../interfaces/audit-row.interface';
import { WaitForAudit } from '../interfaces/wait-for-audit.interface';

export class AuditLogHelper {
  static async waitFor ({ entityId, action }: WaitForAudit): Promise<AuditRow> {
    const deadline = Date.now() + AUDIT_LOG_TEST.TIMEOUT_MS;

    while (Date.now() < deadline) {
      const [row] = await DbHelper.query<AuditRow>({ sql: AUDIT_LOG_TEST.SQL, params: [entityId, action] });
      if (row) return row;
      await delay(AUDIT_LOG_TEST.INTERVAL_MS);
    }

    throw new Error(`No ${action} audit row for ${entityId}`);
  }
}
