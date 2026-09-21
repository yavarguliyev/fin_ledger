import { z } from 'zod';

import type { IPaymentProvider } from '../../interfaces/payment-provider.interface';

export const RegisterProviderSchema = z.object({
  provider: z.custom<IPaymentProvider>()
});

export type RegisterProviderDto = z.infer<typeof RegisterProviderSchema>;
