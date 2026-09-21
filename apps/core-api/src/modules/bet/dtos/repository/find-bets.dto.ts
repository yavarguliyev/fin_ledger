import { z } from 'zod';
import { BetStatus } from '@common/libs';

export const FindBetsSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).optional(),

  status: z.enum(BetStatus, { message: 'Status must be a valid bet status' }).optional(),

  limit: z.number({ message: 'Limit must be a number' }).int({ message: 'Limit must be an integer' }).positive({ message: 'Limit must be positive' }),

  offset: z.number({ message: 'Offset must be a number' }).int({ message: 'Offset must be an integer' }).nonnegative({ message: 'Offset cannot be negative' })
});

export type FindBetsDto = z.infer<typeof FindBetsSchema>;
