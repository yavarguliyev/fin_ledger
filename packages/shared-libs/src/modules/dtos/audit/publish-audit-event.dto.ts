import { z } from 'zod';

export const PublishAuditEventSchema = z.object({
  payload: z.record(z.string(), z.unknown()),

  topic: z.string({ message: 'Topic must be a string' }),

  key: z.string().optional()
});

export type PublishAuditEventDto = z.infer<typeof PublishAuditEventSchema>;
