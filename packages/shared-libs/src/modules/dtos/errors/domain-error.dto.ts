import { z } from 'zod';

export const DomainErrorInputSchema = z.object({
  message: z.string({ message: 'Message must be a string' }),

  code: z.string({ message: 'Code must be a string' })
});

export type DomainErrorInputDto = z.infer<typeof DomainErrorInputSchema>;
