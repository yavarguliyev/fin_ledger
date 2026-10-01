import { z } from 'zod';

export const CallIdRequestSchema = z.object({ callId: z.uuid({ message: 'Call ID must be a valid UUID' }) });

export type CallIdRequestDto = z.infer<typeof CallIdRequestSchema>;
