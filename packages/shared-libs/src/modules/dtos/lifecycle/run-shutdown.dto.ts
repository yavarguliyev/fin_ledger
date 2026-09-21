import { z } from 'zod';

import { ShutdownContextSchema } from './shutdown-context.dto';

export const RunShutdownSchema = z.object({
  context: ShutdownContextSchema,

  signal: z.string({ message: 'Signal must be a string' })
});

export type RunShutdownDto = z.infer<typeof RunShutdownSchema>;
