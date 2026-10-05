import { z } from 'zod';

export const AlertDurationSchema = z.object({
  startsAt: z.string().optional(),
  endsAt: z.string().optional()
});

export type AlertDurationDto = z.infer<typeof AlertDurationSchema>;
