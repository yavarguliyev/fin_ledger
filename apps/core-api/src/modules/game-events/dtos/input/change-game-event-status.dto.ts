import { z } from 'zod';
import { GameEventStatus } from '@common/libs';

export const ChangeGameEventStatusSchema = z.object({
  eventId: z.uuid({ message: 'Event ID must be a valid UUID' }),

  status: z.enum(GameEventStatus, { message: 'Status must be a valid GameEventStatus' })
});

export type ChangeGameEventStatusDto = z.infer<typeof ChangeGameEventStatusSchema>;
