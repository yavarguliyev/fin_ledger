import { z } from 'zod';

import { AUDIT_ACTIONS } from '../../constants/audit/audit-actions.constant';
import { AUDIT_ENTITY_TYPES } from '../../constants/audit/audit-entity-types.constant';
import { AuditActorSchema } from './audit-actor.dto';

export const AuditEventSchema = AuditActorSchema.extend({
  action: z.enum(AUDIT_ACTIONS, { message: 'Invalid audit action' }),

  entityType: z.enum(AUDIT_ENTITY_TYPES, { message: 'Invalid audit entity type' }),

  entityId: z.string().optional(),

  afterState: z.record(z.string(), z.unknown()).optional(),

  occurredAt: z.string({ message: 'Occurred at must be a string' })
});

export type AuditEventDto = z.infer<typeof AuditEventSchema>;
