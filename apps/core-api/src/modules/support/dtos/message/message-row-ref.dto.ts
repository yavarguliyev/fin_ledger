import { z } from 'zod';

import { SupportMessageSchema } from './support-message.dto';

export const MessageRowRefSchema = z.object({ row: SupportMessageSchema });

export type MessageRowRefDto = z.infer<typeof MessageRowRefSchema>;
