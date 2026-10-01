import { z } from 'zod';
import { SupportDeleteScope } from '@common/libs';

import { MessageIdRequestSchema } from './message-id-request.dto';

export const DeleteMessageRequestSchema = MessageIdRequestSchema.extend({
  scope: z.enum(SupportDeleteScope, { message: 'Scope must be ME or EVERYONE' })
});

export type DeleteMessageRequestDto = z.infer<typeof DeleteMessageRequestSchema>;
