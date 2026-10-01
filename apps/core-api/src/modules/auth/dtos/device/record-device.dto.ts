import { z } from 'zod';

export const RecordDeviceSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  visitorId: z.string({ message: 'Visitor ID must be a string' }),

  userAgent: z.string({ message: 'User agent must be a string' }).optional(),

  ip: z.string({ message: 'IP must be a string' }).optional()
});

export type RecordDeviceDto = z.infer<typeof RecordDeviceSchema>;
