import { z } from 'zod';

import { ProviderErrorCategory } from '../../enums/common/provider-error-category.enum';

export const ProviderErrorInputSchema = z.object({
  message: z.string({ message: 'Message must be a string' }),

  category: z.enum(ProviderErrorCategory, { message: 'Invalid provider error category' }),

  code: z.string().optional()
});

export type ProviderErrorInputDto = z.infer<typeof ProviderErrorInputSchema>;
