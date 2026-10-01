import { z } from 'zod';

import { SupportMessageSchema } from '../message/support-message.dto';

export const MessageRowsRefSchema = z.object({ rows: z.array(SupportMessageSchema) });

export type MessageRowsRefDto = z.infer<typeof MessageRowsRefSchema>;
