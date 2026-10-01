import { z } from 'zod';

import { SUPPORT } from '../../constants/chat/support.constant';
import { SUPPORT_ATTACHMENT } from '../../constants/attachment/support-attachment.constant';

export const AttachmentCaptionRequestSchema = z.object({
  body: z.string({ message: 'Body must be a string' }).trim().max(SUPPORT.BODY_MAX_LENGTH, { message: 'Message is too long' }).optional(),

  durationSeconds: z.coerce
    .number({ message: 'Duration must be a number' })
    .int()
    .positive()
    .max(SUPPORT_ATTACHMENT.MAX_DURATION_SECONDS, { message: 'Recording is too long' })
    .optional()
});

export type AttachmentCaptionRequestDto = z.infer<typeof AttachmentCaptionRequestSchema>;
