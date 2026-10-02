import { z } from 'zod';

import { RejectedFileSchema } from '../storage/rejected-file.dto';

export const RejectedFilesSchema = z.object({ rejected: z.array(RejectedFileSchema) });

export type RejectedFilesDto = z.infer<typeof RejectedFilesSchema>;
