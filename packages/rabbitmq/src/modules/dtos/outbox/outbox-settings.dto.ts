import { z } from 'zod';

export const OutboxSettingsSchema = z.object({
  batchSize: z.number({ message: 'Batch size must be a number' }).int().positive(),

  pollIntervalMs: z.number({ message: 'Poll interval must be a number' }).int().positive()
});

export type OutboxSettingsDto = z.infer<typeof OutboxSettingsSchema>;
