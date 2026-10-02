import { z } from 'zod';

export const AlertmanagerAlertSchema = z.object({
  status: z.string({ message: 'Alert status must be a string' }),

  labels: z.record(z.string(), z.string(), { message: 'Alert labels must be a string map' }),

  annotations: z.record(z.string(), z.string(), { message: 'Alert annotations must be a string map' }).optional(),

  startsAt: z.string({ message: 'Alert start must be a string' }).optional()
});

export type AlertmanagerAlertDto = z.infer<typeof AlertmanagerAlertSchema>;
