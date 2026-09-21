import { z } from 'zod';

import { DomainErrorInputSchema } from './domain-error.dto';

export const InfrastructureErrorInputSchema = DomainErrorInputSchema.extend({
  retryable: z.boolean().optional(),

  httpStatus: z.number({ message: 'httpStatus must be a number' }).optional()
});

export type InfrastructureErrorInputDto = z.infer<typeof InfrastructureErrorInputSchema>;
