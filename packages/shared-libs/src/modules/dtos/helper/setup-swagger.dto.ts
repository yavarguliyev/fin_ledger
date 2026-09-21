import { z } from 'zod';
import { INestApplication } from '@nestjs/common';

import { SwaggerOptions } from '../../interfaces/swagger-options.interface';

export const SetupSwaggerSchema = z.object({
  app: z.custom<INestApplication>(),

  options: z.custom<SwaggerOptions>()
});

export type SetupSwaggerDto = z.infer<typeof SetupSwaggerSchema>;
