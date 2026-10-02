import { z } from 'zod';

export const RedactingLoggerOptionsSchema = z.object({ revealLinks: z.boolean({ message: 'Reveal links must be a boolean' }) });

export type RedactingLoggerOptionsDto = z.infer<typeof RedactingLoggerOptionsSchema>;
