import { z } from 'zod';

export const EndpointSchema = z.object({
  endpoint: z.string({ message: 'Endpoint must be a string' }).optional()
});

export type EndpointDto = z.infer<typeof EndpointSchema>;
