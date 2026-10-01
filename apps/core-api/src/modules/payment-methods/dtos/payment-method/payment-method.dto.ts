import { z } from 'zod';
import { PaymentProvider } from '@common/libs';
import { PaymentMethodContractSchema } from '@common/contracts';

export const PaymentMethodSchema = PaymentMethodContractSchema.extend({
  provider: z.enum(PaymentProvider, { message: 'Invalid payment provider' }),

  providerMethodId: z.string({ message: 'Provider method ID must be a string' }).optional().nullable(),

  fingerprint: z.string({ message: 'Fingerprint must be a string' }).optional().nullable(),

  verifiedAt: z.date({ message: 'Verified at must be a valid date' }).optional().nullable(),

  deletedAt: z.date({ message: 'Deleted at must be a valid date' }).optional().nullable(),

  failureReason: z.string({ message: 'Failure reason must be a string' }).optional().nullable(),

  createdAt: z.date({ message: 'Created at must be a valid date' }),

  updatedAt: z.date({ message: 'Updated at must be a valid date' })
});

export type PaymentMethodDto = z.infer<typeof PaymentMethodSchema>;
