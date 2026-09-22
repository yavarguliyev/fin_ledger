import { z } from 'zod';

export const RandomBytesSchema = z.object({
  bytes: z.number({ message: 'Bytes must be a number' }).int({ message: 'Bytes must be an integer' }).positive({ message: 'Bytes must be positive' })
});

export type RandomBytesDto = z.infer<typeof RandomBytesSchema>;
