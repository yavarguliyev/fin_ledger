import { z } from 'zod';

export const AdapterNameSchema = z.object({
  name: z.string({ message: 'Adapter name must be a string' })
});

export type AdapterNameDto = z.infer<typeof AdapterNameSchema>;
