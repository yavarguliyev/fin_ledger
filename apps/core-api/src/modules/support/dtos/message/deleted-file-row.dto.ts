import { z } from 'zod';

import { SupportMessageSchema } from './support-message.dto';

export const DeletedFileRowSchema = SupportMessageSchema.extend({
  removedKey: z.string({ message: 'Removed key must be a string' })
});

export type DeletedFileRowDto = z.infer<typeof DeletedFileRowSchema>;
