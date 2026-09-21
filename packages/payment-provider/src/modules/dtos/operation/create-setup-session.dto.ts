import { z } from 'zod';

export const CreateSetupSessionSchema = z.object({
  customerEmail: z.string({ message: 'Customer email must be a string' }).optional(),

  returnUrl: z.string({ message: 'Return URL must be a string' })
});

export type CreateSetupSessionDto = z.infer<typeof CreateSetupSessionSchema>;
