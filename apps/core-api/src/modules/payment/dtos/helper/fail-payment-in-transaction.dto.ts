import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { FailPaymentSchema } from '../input/fail-payment.dto';

export const FailPaymentInTransactionSchema = FailPaymentSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type FailPaymentInTransactionDto = z.infer<typeof FailPaymentInTransactionSchema>;
