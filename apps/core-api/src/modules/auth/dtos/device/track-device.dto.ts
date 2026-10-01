import { z } from 'zod';

export const TrackDeviceSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  email: z.string({ message: 'Email must be a string' })
});

export type TrackDeviceDto = z.infer<typeof TrackDeviceSchema>;
