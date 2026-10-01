import { z } from 'zod';

import { DomainErrorInputSchema } from './domain-error.dto';

export const ApplicationErrorInputSchema = DomainErrorInputSchema.extend({
  statusCode: z.number({ message: 'statusCode must be a number' }).optional(),

  cause: z.unknown().optional()
});

export type ApplicationErrorInputDto = z.infer<typeof ApplicationErrorInputSchema>;
