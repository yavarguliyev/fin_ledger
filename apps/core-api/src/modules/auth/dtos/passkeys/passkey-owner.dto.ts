import { z } from 'zod';

export const PasskeyOwnerSchema = z.object({ userId: z.string({ message: 'User ID must be a string' }) });

export type PasskeyOwnerDto = z.infer<typeof PasskeyOwnerSchema>;
