import { z } from 'zod';

import { SUPPORT_REACTION_EMOJIS } from '@common/contracts';

export const ReactionRequestSchema = z.object({
  emoji: z.enum(SUPPORT_REACTION_EMOJIS, { message: 'Pick one of the offered reactions' })
});

export type ReactionRequestDto = z.infer<typeof ReactionRequestSchema>;
