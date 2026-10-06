import { z } from 'zod';

import { SUPPORT_PANEL } from '../../constants/chat/support-panel.constant';

export const DeleteFilesRequestSchema = z.object({
  messageIds: z
    .array(z.uuid({ message: 'Message ID must be a valid UUID' }), { message: 'Message IDs must be a list' })
    .min(1, { message: 'Pick at least one file' })
    .max(SUPPORT_PANEL.BULK_DELETE_MAX, { message: 'Too many files at once' })
});

export type DeleteFilesRequestDto = z.infer<typeof DeleteFilesRequestSchema>;
