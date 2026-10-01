import { z } from 'zod';

export const BackoffSchema = z.object({ attempts: z.number({ message: 'Attempts must be a number' }).int() });

export type BackoffDto = z.infer<typeof BackoffSchema>;
