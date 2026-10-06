import { Type } from '@nestjs/common';
import { ClientIds } from '@common/libs';
import { z } from 'zod';

import { HttpSetup } from '../../types/http-setup.type';

export const AppBootstrapSchema = z.object({
  module: z.custom<Type<unknown>>(),

  context: z.enum(ClientIds, { message: 'Context must be a valid client id' }),

  http: z.custom<HttpSetup>().optional()
});

export type AppBootstrapDto = z.infer<typeof AppBootstrapSchema>;
