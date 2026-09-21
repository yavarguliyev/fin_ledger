import { z } from 'zod';

import type { RequestContext } from '../../interfaces/request-context.interface';

export const RequestRefSchema = z.object({
  request: z.custom<RequestContext>()
});

export type RequestRefDto = z.infer<typeof RequestRefSchema>;
