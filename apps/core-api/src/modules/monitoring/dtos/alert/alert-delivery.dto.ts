import { z } from 'zod';

import { AlertMessageSchema } from './alert-message.dto';

export const AlertDeliverySchema = z.object({
  admin: z.object({ id: z.string(), email: z.string() }),
  message: AlertMessageSchema
});

export type AlertDeliveryDto = z.infer<typeof AlertDeliverySchema>;
