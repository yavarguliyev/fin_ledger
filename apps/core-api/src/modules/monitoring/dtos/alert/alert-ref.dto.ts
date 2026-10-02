import { z } from 'zod';

import { AlertmanagerAlertSchema } from './alertmanager-alert.dto';

export const AlertRefSchema = z.object({
  alert: AlertmanagerAlertSchema
});

export type AlertRefDto = z.infer<typeof AlertRefSchema>;
