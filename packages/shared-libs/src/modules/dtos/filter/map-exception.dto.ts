import { z } from 'zod';

export const MapExceptionSchema = z.object({
  exception: z.unknown(),

  correlationId: z.string({ message: 'Correlation ID must be a string' })
});

export type MapExceptionDto = z.infer<typeof MapExceptionSchema>;
