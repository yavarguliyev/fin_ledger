import { z } from 'zod';
import { DatabaseAdapter } from '@common/libs';

import { CompletePaymentSchema } from '../input/complete-payment.dto';

export const CompletePaymentInTransactionSchema = CompletePaymentSchema.extend({
  adapter: z.custom<DatabaseAdapter>()
});

export type CompletePaymentInTransactionDto = z.infer<typeof CompletePaymentInTransactionSchema>;
