import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

export const AdapterCredentialsSchema = z.object({
  configService: z.custom<ConfigService>(),

  keys: z.array(z.string())
});

export type AdapterCredentialsDto = z.infer<typeof AdapterCredentialsSchema>;
