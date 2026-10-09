import { z } from 'zod';
import { SUPPORT_CHAT_THEMES } from '@common/contracts';

export const ThemeRequestSchema = z.object({
  theme: z.enum(SUPPORT_CHAT_THEMES, { message: 'Theme must be a valid chat theme' })
});

export type ThemeRequestDto = z.infer<typeof ThemeRequestSchema>;
