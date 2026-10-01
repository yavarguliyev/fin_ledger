import { z } from 'zod';

import { StoredAttachmentSchema } from '../attachment/stored-attachment.dto';

export const EditMessageRowSchema = z.object({
  id: z.string({ message: 'ID must be a string' }),

  body: z.string({ message: 'Body must be a string' }).nullable(),

  attachment: StoredAttachmentSchema.nullable()
});

export type EditMessageRowDto = z.infer<typeof EditMessageRowSchema>;
