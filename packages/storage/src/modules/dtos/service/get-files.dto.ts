import { z } from 'zod';

import { FileSelectionSchema } from './file-selection.dto';

export const GetFilesSchema = FileSelectionSchema.extend({
  expiresIn: z.number({ message: 'Expires in must be a number' }).int().positive().optional()
});

export type GetFilesDto = z.infer<typeof GetFilesSchema>;
