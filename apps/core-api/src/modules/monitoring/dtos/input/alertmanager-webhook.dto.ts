import { z } from 'zod';

import { AlertmanagerAlertSchema } from '../alert/alertmanager-alert.dto';

export const AlertmanagerWebhookSchema = z.object({
  status: z.string({ message: 'Webhook status must be a string' }),

  alerts: z.array(AlertmanagerAlertSchema, { message: 'Alerts must be a list' }).max(500)
});

export type AlertmanagerWebhookDto = z.infer<typeof AlertmanagerWebhookSchema>;
