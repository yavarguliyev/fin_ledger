import { z } from 'zod';

export const PrivacyResponseSchema = z.object({
  privacyEnabled: z.boolean({ message: 'Privacy enabled must be a boolean' })
});

export type PrivacyResponseDto = z.infer<typeof PrivacyResponseSchema>;
