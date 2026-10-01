import { z } from 'zod';
import { PaymentCapability } from '@common/shared-libs';

import type { IPaymentProvider } from '../../types/payment-provider.type';

export const ProviderContractOptionsSchema = z.object({
  name: z.string({ message: 'Name must be a string' }),

  create: z.custom<() => IPaymentProvider>(),

  expectedCapabilities: z.array(z.enum(PaymentCapability)).readonly().optional()
});

export type ProviderContractOptionsDto = z.infer<typeof ProviderContractOptionsSchema>;
