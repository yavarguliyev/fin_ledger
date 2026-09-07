import { z } from 'zod';
import { GameEventStatus } from '@common/libs';

export const GameEventSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  createdAtid: z.string({ message: 'Created at ID must be a string' }),

  updatedAt: z.string({ message: 'Updated at must be a string' }),

  label: z.string({ message: 'Label must be a string' }),

  odds: z.string({ message: 'Odds must be a string' }),

  status: z.enum(GameEventStatus, { message: 'Status must be a valid game event status' })
});

export type GameEventDto = z.infer<typeof GameEventSchema>;
