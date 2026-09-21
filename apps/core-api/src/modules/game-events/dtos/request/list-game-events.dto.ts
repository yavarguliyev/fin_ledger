import { z } from 'zod';
import { GameEventStatus } from '@common/libs';

export const ListGameEventsSchema = z.object({
  status: z.enum(GameEventStatus, { message: 'Status must be a valid game event status' }).optional()
});

export type ListGameEventsDto = z.infer<typeof ListGameEventsSchema>;
