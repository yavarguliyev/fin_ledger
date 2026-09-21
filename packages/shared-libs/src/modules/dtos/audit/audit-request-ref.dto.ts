import { z } from 'zod';

import type { AuditRequest } from '../../interfaces/audit-request.interface';

export const AuditRequestRefSchema = z.object({
  request: z.custom<AuditRequest>()
});

export type AuditRequestRefDto = z.infer<typeof AuditRequestRefSchema>;
