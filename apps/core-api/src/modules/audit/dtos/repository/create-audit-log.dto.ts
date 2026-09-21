import { z } from 'zod';

import { AuditLogSchema } from '../audit/audit-log.dto';

export const CreateAuditLogSchema = AuditLogSchema.omit({ id: true, createdAt: true });

export type CreateAuditLogDto = z.infer<typeof CreateAuditLogSchema>;
