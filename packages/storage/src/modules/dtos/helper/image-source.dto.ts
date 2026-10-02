import { z } from 'zod';

export const ImageSourceSchema = z.object({
  buffer: z.custom<Buffer>(),

  width: z.number({ message: 'Width must be a number' }).int().nonnegative(),

  height: z.number({ message: 'Height must be a number' }).int().nonnegative(),

  hevc: z.boolean({ message: 'HEVC flag must be a boolean' })
});

export type ImageSourceDto = z.infer<typeof ImageSourceSchema>;
