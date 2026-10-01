import { z } from 'zod';

export const CallIdRefSchema = z.object({ callId: z.string({ message: 'Call ID must be a string' }) });

export type CallIdRefDto = z.infer<typeof CallIdRefSchema>;
