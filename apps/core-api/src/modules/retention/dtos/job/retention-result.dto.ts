import { z } from 'zod';

export const RetentionResultSchema = z.object({
  outboxEvents: z.number({ message: 'Outbox events must be a number' }).int().nonnegative(),

  webhookEvents: z.number({ message: 'Webhook events must be a number' }).int().nonnegative()
});

export type RetentionResultDto = z.infer<typeof RetentionResultSchema>;
