import { z } from 'zod';

export const PresenceCountSchema = z.object({ total: z.number({ message: 'Total must be a number' }).int().nonnegative() });

export type PresenceCountDto = z.infer<typeof PresenceCountSchema>;
