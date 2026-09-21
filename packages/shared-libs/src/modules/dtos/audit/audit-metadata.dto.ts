import { z } from 'zod';

import { AUDIT_ACTIONS } from '../../constants/audit-actions.constant';
import { AUDIT_ENTITY_TYPES } from '../../constants/audit-entity-types.constant';

export const AuditMetadataSchema = z.object({
  action: z.enum(AUDIT_ACTIONS, { message: 'Invalid audit action' }),

  entityType: z.enum(AUDIT_ENTITY_TYPES, { message: 'Invalid audit entity type' }),

  entityIdParam: z.string().optional()
});

export type AuditMetadataDto = z.infer<typeof AuditMetadataSchema>;
