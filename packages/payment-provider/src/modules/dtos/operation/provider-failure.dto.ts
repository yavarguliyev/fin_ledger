import { z } from 'zod';
import { ProviderErrorCategory } from '@common/shared-libs';

export const ProviderFailureSchema = z.object({
  code: z.string({ message: 'Failure code must be a string' }),

  category: z.enum(ProviderErrorCategory),

  message: z.string({ message: 'Failure message must be a string' }),

  retryable: z.boolean({ message: 'Retryable must be a boolean' }),

  indeterminate: z.boolean({ message: 'Indeterminate must be a boolean' })
});

export type ProviderFailureDto = z.infer<typeof ProviderFailureSchema>;
