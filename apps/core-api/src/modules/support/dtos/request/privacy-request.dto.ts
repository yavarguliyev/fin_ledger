import { z } from 'zod';

export const PrivacyRequestSchema = z.object({
  enabled: z.boolean({ message: 'Enabled must be true or false' })
});

export type PrivacyRequestDto = z.infer<typeof PrivacyRequestSchema>;
