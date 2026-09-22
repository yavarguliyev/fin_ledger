import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { PaymentSchema } from '../payment/payment.dto';

export const MoveFundsSchema = z.object({
  payment: PaymentSchema,

  adapter: z.custom<DatabaseAdapter>()
});

export type MoveFundsDto = z.infer<typeof MoveFundsSchema>;
