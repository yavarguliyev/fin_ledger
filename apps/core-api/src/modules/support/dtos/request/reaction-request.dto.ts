import { z } from 'zod';

import { EmojiHelper } from '../../helpers/emoji.helper';
import { MESSAGE_REACTION } from '../../constants/chat/message-reaction.constant';

export const ReactionRequestSchema = z.object({
  emoji: z
    .string({ message: MESSAGE_REACTION.NOT_EMOJI_MESSAGE })
    .refine(value => EmojiHelper.isSingleEmoji({ value }), { message: MESSAGE_REACTION.NOT_EMOJI_MESSAGE })
});

export type ReactionRequestDto = z.infer<typeof ReactionRequestSchema>;
