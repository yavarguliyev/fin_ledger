import { z } from 'zod';

import type { AuditRequest } from '../../interfaces/audit-request.interface';
import { AuditMetadataSchema } from './audit-metadata.dto';

export const BuildAuditEventSchema = z.object({
  metadata: AuditMetadataSchema,

  request: z.custom<AuditRequest>(),

  result: z.unknown()
});

export type BuildAuditEventDto = z.infer<typeof BuildAuditEventSchema>;
