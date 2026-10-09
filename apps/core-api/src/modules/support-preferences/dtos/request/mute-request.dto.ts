import { z } from 'zod';
import { SUPPORT_MUTE_DURATIONS } from '@common/contracts';

export const MuteRequestSchema = z.object({
  duration: z.enum(SUPPORT_MUTE_DURATIONS, { message: 'Duration must be a valid mute duration' })
});

export type MuteRequestDto = z.infer<typeof MuteRequestSchema>;
