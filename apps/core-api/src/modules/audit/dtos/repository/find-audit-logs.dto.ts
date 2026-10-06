import { z } from 'zod';

export const FindAuditLogsSchema = z.object({
  limit: z.number().int().positive(),

  action: z.string({ message: 'Action must be a string' }).optional(),

  entityType: z.string({ message: 'Entity type must be a string' }).optional(),

  entityId: z.uuid({ message: 'Entity ID must be a UUID' }).optional(),

  actorUserId: z.uuid({ message: 'Actor user ID must be a UUID' }).optional(),

  before: z.iso.datetime({ offset: true, message: 'Before must be an ISO date-time' }).optional(),

  beforeId: z.uuid({ message: 'Before ID must be a UUID' }).optional()
});

export type FindAuditLogsDto = z.infer<typeof FindAuditLogsSchema>;
