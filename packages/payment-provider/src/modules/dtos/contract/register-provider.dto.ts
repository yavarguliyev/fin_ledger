import { z } from 'zod';

import type { IPaymentProvider } from '../../types/payment-provider.type';

export const RegisterProviderSchema = z.object({ provider: z.custom<IPaymentProvider>() });

export type RegisterProviderDto = z.infer<typeof RegisterProviderSchema>;
