import { z } from 'zod';

export const ListenerRetrySchema = z.object({ reason: z.string({ message: 'Reason must be a string' }) });

export type ListenerRetryDto = z.infer<typeof ListenerRetrySchema>;
