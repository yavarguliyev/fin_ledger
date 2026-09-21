import { z } from 'zod';

export const ExtractIdKeySchema = z.object({
  result: z.unknown(),

  field: z.enum(['walletId', 'paymentId', 'userId'], { message: 'Field must be walletId, paymentId or userId' })
});

export type ExtractIdKeyDto = z.infer<typeof ExtractIdKeySchema>;
