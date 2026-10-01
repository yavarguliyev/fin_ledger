import { z } from 'zod';

import { AttachmentType } from '../../interfaces/attachment-type.interface';

export const SignatureMatchSchema = z.object({
  type: z.custom<AttachmentType>(),

  buffer: z.custom<Buffer>()
});

export type SignatureMatchDto = z.infer<typeof SignatureMatchSchema>;
