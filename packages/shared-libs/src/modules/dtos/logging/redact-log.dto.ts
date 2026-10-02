import { z } from 'zod';

export const RedactLogSchema = z.object({
  message: z.string({ message: 'Message must be a string' }),

  revealLinks: z.boolean({ message: 'Reveal links must be a boolean' })
});

export type RedactLogDto = z.infer<typeof RedactLogSchema>;
