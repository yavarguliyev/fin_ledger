import { z } from 'zod';

export const RequestHeaderSchema = z.object({
  value: z.union([z.string(), z.array(z.string()), z.undefined()]),

  maxLength: z.number({ message: 'Max length must be a number' }).int()
});

export type RequestHeaderDto = z.infer<typeof RequestHeaderSchema>;
