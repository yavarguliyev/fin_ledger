import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

export const EnvValueSchema = z.object({
  key: z.string({ message: 'Key must be a string' }),

  configService: z.custom<ConfigService>()
});

export type EnvValueDto = z.infer<typeof EnvValueSchema>;
