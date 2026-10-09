import { z } from 'zod';
import { SUPPORT_CHAT_THEMES } from '@common/contracts';

export const ThemeResponseSchema = z.object({
  theme: z.enum(SUPPORT_CHAT_THEMES, { message: 'Theme must be a valid chat theme' }).nullable()
});

export type ThemeResponseDto = z.infer<typeof ThemeResponseSchema>;
