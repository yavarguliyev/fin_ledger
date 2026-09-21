import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

export const ConfigServiceRefSchema = z.object({
  configService: z.custom<ConfigService>()
});

export type ConfigServiceRefDto = z.infer<typeof ConfigServiceRefSchema>;
