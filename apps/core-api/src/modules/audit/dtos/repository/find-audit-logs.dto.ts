import { z } from 'zod';

import { ListAuditLogsSchema } from '../request/list-audit-logs.dto';

export const FindAuditLogsSchema = ListAuditLogsSchema.omit({ page: true }).extend({
  offset: z.number({ message: 'Offset must be a number' }).int({ message: 'Offset must be an integer' }).nonnegative({ message: 'Offset cannot be negative' })
});

export type FindAuditLogsDto = z.infer<typeof FindAuditLogsSchema>;
