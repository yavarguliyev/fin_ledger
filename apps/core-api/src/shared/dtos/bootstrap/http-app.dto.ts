import { NestExpressApplication } from '@nestjs/platform-express';
import { z } from 'zod';

export const HttpAppSchema = z.object({
  app: z.custom<NestExpressApplication>()
});

export type HttpAppDto = z.infer<typeof HttpAppSchema>;
