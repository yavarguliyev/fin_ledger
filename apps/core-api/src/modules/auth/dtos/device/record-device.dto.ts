import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

export const RecordDeviceSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  visitorId: z.string({ message: 'Visitor ID must be a string' }),

  userAgent: z.string({ message: 'User agent must be a string' }).optional(),

  ip: z.string({ message: 'IP must be a string' }).optional(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type RecordDeviceDto = z.infer<typeof RecordDeviceSchema>;
