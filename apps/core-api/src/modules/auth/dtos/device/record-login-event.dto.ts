import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const RecordLoginEventSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  visitorId: z.string({ message: 'Visitor ID must be a string' }).optional(),

  userAgent: z.string({ message: 'User agent must be a string' }).optional(),

  ip: z.string({ message: 'IP must be a string' }).optional(),

  isNewDevice: z.boolean({ message: 'Is new device must be a boolean' }),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type RecordLoginEventDto = z.infer<typeof RecordLoginEventSchema>;
