import { z } from 'zod';

import { UserRoles } from '../../enums/common/auth.enum';

export const AuditActorSchema = z.object({
  actorUserId: z.string().optional(),

  actorRole: z.enum(UserRoles, { message: 'Actor role must be a valid user role' }).optional(),

  actorService: z.string().optional(),

  ipAddress: z.string().optional(),

  userAgent: z.string().optional(),

  requestId: z.string().optional()
});

export type AuditActorDto = z.infer<typeof AuditActorSchema>;
