import { z } from 'zod';

import { StoredCallSchema } from './stored-call.dto';

export const CallRefSchema = z.object({ call: StoredCallSchema });

export type CallRefDto = z.infer<typeof CallRefSchema>;
