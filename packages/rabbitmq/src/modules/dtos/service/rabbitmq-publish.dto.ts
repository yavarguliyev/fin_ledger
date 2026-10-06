import { z } from 'zod';
import { BrokerPublishSchema } from '@common/messaging';

export const RabbitmqPublishSchema = BrokerPublishSchema.extend({
  exchange: z.string({ message: 'Exchange must be a string' }).optional(),

  persistent: z.boolean({ message: 'Persistent must be a boolean' }).optional()
});

export type RabbitmqPublishDto = z.infer<typeof RabbitmqPublishSchema>;
