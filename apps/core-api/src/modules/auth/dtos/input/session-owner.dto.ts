import { z } from 'zod';

export const SessionOwnerSchema = z.object({ userId: z.string({ message: 'User ID must be a string' }) });

export type SessionOwnerDto = z.infer<typeof SessionOwnerSchema>;
