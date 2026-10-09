import { z } from 'zod';

import { MuteRequestSchema } from '../request/mute-request.dto';
import { ReadConversationSchema } from '../../../support';

export const MuteConversationSchema = ReadConversationSchema.extend(MuteRequestSchema.shape);

export type MuteConversationDto = z.infer<typeof MuteConversationSchema>;
