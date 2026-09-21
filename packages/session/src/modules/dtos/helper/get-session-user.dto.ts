import { z } from 'zod';

import { RequestContext } from '../../interfaces/request-context.interface';

export const GetSessionUserSchema = z.object({
  context: z.custom<RequestContext>()
});

export type GetSessionUserDto = z.infer<typeof GetSessionUserSchema>;
