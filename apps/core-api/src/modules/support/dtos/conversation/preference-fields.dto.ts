import { SupportConversationContractSchema } from '@common/contracts';
import { z } from 'zod';

export const PreferenceFieldsSchema = SupportConversationContractSchema.pick({
  muted: true,
  mutedUntil: true,
  pinnedAt: true,
  favourite: true,
  theme: true
});

export type PreferenceFieldsDto = z.infer<typeof PreferenceFieldsSchema>;
