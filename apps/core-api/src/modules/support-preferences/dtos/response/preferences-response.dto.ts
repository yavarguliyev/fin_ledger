import { z } from 'zod';

export const PreferencesResponseSchema = z.object({
  muted: z.boolean({ message: 'Muted must be a boolean' }),

  mutedUntil: z.string({ message: 'Muted until must be a string' }).nullable(),

  pinnedAt: z.string({ message: 'Pinned at must be a string' }).nullable(),

  favourite: z.boolean({ message: 'Favourite must be a boolean' })
});

export type PreferencesResponseDto = z.infer<typeof PreferencesResponseSchema>;
