import { z } from 'zod';
import { UserRoles } from '@common/libs';

export const AuditLogSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  actorUserId: z.string({ message: 'Actor user ID must be a string' }).nullable().optional(),

  actorRole: z.enum(UserRoles, { message: 'Actor role must be a valid user role' }).nullable().optional(),

  actorService: z.string({ message: 'Actor service must be a string' }).nullable().optional(),

  action: z.string({ message: 'Action must be a string' }),

  entityType: z.string({ message: 'Entity type must be a string' }),

  entityId: z.string({ message: 'Entity ID must be a string' }).nullable().optional(),

  beforeState: z.unknown().nullable().optional(),

  afterState: z.unknown().nullable().optional(),

  ipAddress: z.string({ message: 'IP address must be a string' }).nullable().optional(),

  userAgent: z.string({ message: 'User agent must be a string' }).nullable().optional(),

  requestId: z.string({ message: 'Request ID must be a string' }).nullable().optional(),

  createdAt: z.string({ message: 'Created at must be a string' })
});

export type AuditLogDto = z.infer<typeof AuditLogSchema>;
