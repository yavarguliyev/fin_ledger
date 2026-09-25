import { z } from 'zod';

export const CreateGameEventSchema = z.object({
  sport: z.string({ message: 'Sport must be a string' }).min(1, { message: 'Sport is required' }),

  label: z.string({ message: 'Label must be a string' }).min(1, { message: 'Label is required' }),

  odds: z.number({ message: 'Odds must be a number' }).gt(1, { message: 'Odds must be greater than 1' }),

  startsAt: z.iso.datetime({ message: 'Starts at must be an ISO date-time' }),

  competition: z.string({ message: 'Competition must be a string' }).optional(),

  bettingClosesAt: z.iso.datetime({ message: 'Betting closes at must be an ISO date-time' }).optional()
});

export type CreateGameEventDto = z.infer<typeof CreateGameEventSchema>;
