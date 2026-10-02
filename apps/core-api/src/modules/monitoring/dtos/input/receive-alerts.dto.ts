import { z } from 'zod';

import { AlertmanagerWebhookSchema } from './alertmanager-webhook.dto';

export const ReceiveAlertsSchema = AlertmanagerWebhookSchema.extend({
  authorization: z.string({ message: 'Authorization must be a string' }).optional()
});

export type ReceiveAlertsDto = z.infer<typeof ReceiveAlertsSchema>;
