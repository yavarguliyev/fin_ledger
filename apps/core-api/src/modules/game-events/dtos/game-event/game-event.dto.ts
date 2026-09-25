import { z } from 'zod';
import { GameEventStatus } from '@common/libs';

export const GameEventSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  createdAt: z.string({ message: 'Created at must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' }),

  label: z.string({ message: 'Label must be a string' }),

  odds: z.string({ message: 'Odds must be a string' }),

  startsAt: z.string({ message: 'Starts at must be a string' }),

  bettingClosesAt: z.string({ message: 'Betting closes at must be a string' }).nullable().optional(),

  status: z.enum(GameEventStatus, { message: 'Status must be a valid game event status' }),

  sport: z.string({ message: 'Sport must be a string' }).optional(),

  competition: z.string({ message: 'Competition must be a string' }).nullable().optional(),

  result: z.string({ message: 'Result must be a string' }).nullable().optional(),

  settledAt: z.string({ message: 'Settled at must be a string' }).nullable().optional()
});

export type GameEventDto = z.infer<typeof GameEventSchema>;
