import { z } from 'zod';

export const PasskeyIdRequestSchema = z.object({ id: z.string({ message: 'ID must be a string' }).min(1, { message: 'ID is required' }) });

export type PasskeyIdRequestDto = z.infer<typeof PasskeyIdRequestSchema>;
