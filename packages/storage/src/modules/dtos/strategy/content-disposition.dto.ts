import { z } from 'zod';

import { CONTENT_DISPOSITION } from '../../constants/download/content-disposition.constant';

export const ContentDispositionSchema = z.object({
  disposition: z.enum(CONTENT_DISPOSITION.VALUES, { message: 'Disposition must be inline or attachment' }),

  fileName: z.string({ message: 'File name must be a string' }).nullable().optional()
});

export type ContentDispositionDto = z.infer<typeof ContentDispositionSchema>;
