import { z } from 'zod';

export const ReceiptSchema = z.object({
  receiptNumber: z.string({ message: 'Receipt number must be a string' }),

  issuedAt: z.string({ message: 'Issued at must be a string' }),

  generatedAt: z.string({ message: 'Generated at must be a string' }),

  typeLabel: z.string({ message: 'Type label must be a string' }),

  amountLabel: z.string({ message: 'Amount label must be a string' }),

  amount: z.string({ message: 'Amount must be a string' }),

  method: z.string({ message: 'Method must be a string' }),

  status: z.string({ message: 'Status must be a string' }),

  customerName: z.string({ message: 'Customer name must be a string' }),

  paymentId: z.string({ message: 'Payment ID must be a string' }),

  providerReference: z.string({ message: 'Provider reference must be a string' }).nullable()
});

export type ReceiptDto = z.infer<typeof ReceiptSchema>;
