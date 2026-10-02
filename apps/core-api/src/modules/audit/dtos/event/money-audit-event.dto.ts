import { z } from 'zod';

export const MoneyAuditEventSchema = z
  .object({
    userId: z.string({ message: 'User Id must be a string' }).optional(),
    walletId: z.string({ message: 'Wallet Id must be a string' }).optional(),
    paymentId: z.string({ message: 'Payment Id must be a string' }).optional()
  })
  .loose();

export type MoneyAuditEventDto = z.infer<typeof MoneyAuditEventSchema>;
