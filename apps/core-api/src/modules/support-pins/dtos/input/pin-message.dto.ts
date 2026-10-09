import { z } from 'zod';

import { MessagePinSchema } from './message-pin.dto';
import { PinMessageRequestSchema } from '../request/pin-message-request.dto';

export const PinMessageSchema = MessagePinSchema.extend(PinMessageRequestSchema.shape);

export type PinMessageDto = z.infer<typeof PinMessageSchema>;
