import { z } from 'zod';
import { HttpException } from '@nestjs/common';

export const MapHttpExceptionSchema = z.object({
  exception: z.custom<HttpException>(),

  correlationId: z.string()
});

export type MapHttpExceptionDto = z.infer<typeof MapHttpExceptionSchema>;
