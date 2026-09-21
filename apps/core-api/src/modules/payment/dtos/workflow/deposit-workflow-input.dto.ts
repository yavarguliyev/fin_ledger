import { z } from 'zod';

import { RequestPaymentDto } from '../request/request-payment.dto';

export const DepositWorkflowInputSchema = z.object({
  userId: z.string({ message: 'User ID must be a string' }),

  dto: z.custom<RequestPaymentDto>()
});

export type DepositWorkflowInputDto = z.infer<typeof DepositWorkflowInputSchema>;
