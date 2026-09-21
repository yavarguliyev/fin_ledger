import { z } from 'zod';

import type { AuditRequest } from '../../interfaces/audit-request.interface';

export const AuditHeaderSchema = z.object({
  request: z.custom<AuditRequest>(),

  name: z.string({ message: 'Header name must be a string' })
});

export type AuditHeaderDto = z.infer<typeof AuditHeaderSchema>;
