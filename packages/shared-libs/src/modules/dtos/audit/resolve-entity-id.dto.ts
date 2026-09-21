import { z } from 'zod';

import type { AuditRequest } from '../../interfaces/audit-request.interface';

export const ResolveEntityIdSchema = z.object({
  request: z.custom<AuditRequest>(),

  result: z.unknown(),

  entityIdParam: z.string().optional()
});

export type ResolveEntityIdDto = z.infer<typeof ResolveEntityIdSchema>;
