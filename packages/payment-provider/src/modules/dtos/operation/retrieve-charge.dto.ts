import { z } from 'zod';

export const RetrieveChargeSchema = z.object({
  chargeId: z.string({ message: 'Charge ID must be a string' }).min(1, { message: 'Charge ID is required' })
});

export type RetrieveChargeDto = z.infer<typeof RetrieveChargeSchema>;
