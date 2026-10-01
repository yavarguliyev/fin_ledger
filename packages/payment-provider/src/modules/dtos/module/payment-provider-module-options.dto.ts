import { z } from 'zod';
import type { Type } from '@nestjs/common';

import type { IPaymentProvider } from '../../types/payment-provider.type';

export const PaymentProviderModuleOptionsSchema = z.object({ adapters: z.custom<Type<IPaymentProvider>[]>().optional() });

export type PaymentProviderModuleOptionsDto = z.infer<typeof PaymentProviderModuleOptionsSchema>;
