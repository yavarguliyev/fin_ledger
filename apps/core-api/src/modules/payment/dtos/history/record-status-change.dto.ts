import { z } from 'zod';
import { DatabaseAdapter, PaymentStatus } from '@common/libs';

export const RecordStatusChangeSchema = z.object({
  paymentId: z.string({ message: 'Payment ID must be a string' }),

  fromStatus: z.string({ message: 'From status must be a string' }).nullable(),

  toStatus: z.enum(PaymentStatus, { message: 'To status must be a valid PaymentStatus enum' }),

  source: z.string({ message: 'Source must be a string' }).optional(),

  adapter: z.custom<DatabaseAdapter>().optional()
});

export type RecordStatusChangeDto = z.infer<typeof RecordStatusChangeSchema>;
