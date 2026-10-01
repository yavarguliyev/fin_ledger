import { z } from 'zod';

export const PersistSightingSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  email: z.string({ message: 'Email must be a string' }),

  visitorId: z.string({ message: 'Visitor ID must be a string' }).optional(),

  userAgent: z.string({ message: 'User agent must be a string' }).optional(),

  ip: z.string({ message: 'IP must be a string' }).optional()
});

export type PersistSightingDto = z.infer<typeof PersistSightingSchema>;
