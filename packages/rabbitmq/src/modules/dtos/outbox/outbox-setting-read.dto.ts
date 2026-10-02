import { z } from 'zod';

import { OutboxSettingsSourceSchema } from './outbox-settings-source.dto';

export const OutboxSettingReadSchema = OutboxSettingsSourceSchema.extend({
  key: z.string({ message: 'Key must be a string' }),

  fallback: z.number({ message: 'Fallback must be a number' }).int().positive()
});

export type OutboxSettingReadDto = z.infer<typeof OutboxSettingReadSchema>;
