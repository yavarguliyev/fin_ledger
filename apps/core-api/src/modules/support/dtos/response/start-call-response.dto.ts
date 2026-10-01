import { z } from 'zod';

export const StartCallResponseSchema = z.object({ callId: z.string({ message: 'Call ID must be a string' }) });

export type StartCallResponseDto = z.infer<typeof StartCallResponseSchema>;
