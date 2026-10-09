import { z } from 'zod';

import { PinRequestSchema } from '../request/pin-request.dto';
import { ReadConversationSchema } from '../../../support';

export const PinConversationSchema = ReadConversationSchema.extend(PinRequestSchema.shape);

export type PinConversationDto = z.infer<typeof PinConversationSchema>;
