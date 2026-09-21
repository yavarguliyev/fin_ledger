import { z } from 'zod';
import { PaymentProvider } from '@common/shared-libs';

export const ProviderNameSchema = z.object({
  providerName: z.enum(PaymentProvider, { message: 'Invalid payment provider' })
});

export type ProviderNameDto = z.infer<typeof ProviderNameSchema>;
