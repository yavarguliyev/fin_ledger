import { z } from 'zod';
import { PaymentProvider, ProviderMethodResultDto } from '@common/libs';

export const FromProviderResultSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }).min(1, { message: 'User ID is required' }),

  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' }),

  result: z.custom<ProviderMethodResultDto>(),

  isDefault: z.boolean({ message: 'isDefault must be a boolean' })
});

export type FromProviderResultDto = z.infer<typeof FromProviderResultSchema>;
