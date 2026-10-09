import { z } from 'zod';

export const ConfigReaderSchema = z.object({
  read: z.custom<(key: string) => string | undefined>()
});

export type ConfigReaderDto = z.infer<typeof ConfigReaderSchema>;
