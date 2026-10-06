import { z } from 'zod';

import { SetPrivacySchema } from './set-privacy.dto';

export const ChangePrivacySchema = SetPrivacySchema.extend({
  role: z.string({ message: 'Role must be a string' })
});

export type ChangePrivacyDto = z.infer<typeof ChangePrivacySchema>;
