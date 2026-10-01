import { z } from 'zod';
import { SupportCallEndReason } from '@common/libs';

import { StoredCallSchema } from './stored-call.dto';

export const CallEndingSchema = z.object({
  call: StoredCallSchema,

  reason: z.enum(SupportCallEndReason)
});

export type CallEndingDto = z.infer<typeof CallEndingSchema>;
