import { z } from 'zod';

import { MoneyAuditEventSchema } from '../event/money-audit-event.dto';

export const RecordMoneyAuditSchema = z.object({
  event: MoneyAuditEventSchema,
  action: z.string({ message: 'Action must be a string' }),
  entityType: z.string({ message: 'Entity type must be a string' }),
  entityId: z.string({ message: 'Entity ID must be a string' }).optional()
});

export type RecordMoneyAuditDto = z.infer<typeof RecordMoneyAuditSchema>;
