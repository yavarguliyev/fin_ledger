import { z } from 'zod';

import { AUDIT_LOG_LIST } from '../../constants/list/audit-log-list.constant';
import { FindAuditLogsSchema } from '../repository/find-audit-logs.dto';

export const ListAuditLogsSchema = FindAuditLogsSchema.extend({
  limit: z.coerce.number({ message: 'Limit must be a number' }).int().positive().max(AUDIT_LOG_LIST.MAX_LIMIT).default(AUDIT_LOG_LIST.DEFAULT_LIMIT)
}).refine(({ before, beforeId }) => !before === !beforeId, { message: AUDIT_LOG_LIST.CURSOR_MESSAGE });

export type ListAuditLogsDto = z.infer<typeof ListAuditLogsSchema>;
