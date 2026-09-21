import { z } from 'zod';
import { PaginatedRequestSchema } from '@common/libs';

export const ListAuditLogsSchema = PaginatedRequestSchema({
  shape: {
    action: z.string({ message: 'Action must be a string' }).optional(),

    entityType: z.string({ message: 'Entity type must be a string' }).optional(),

    entityId: z.string({ message: 'Entity ID must be a string' }).optional(),

    actorUserId: z.string({ message: 'Actor user ID must be a string' }).optional()
  }
});

export type ListAuditLogsDto = z.infer<typeof ListAuditLogsSchema>;
