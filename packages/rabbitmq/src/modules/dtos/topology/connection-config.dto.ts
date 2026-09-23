import { z } from 'zod';
import type { ConfigService } from '@nestjs/config';

export const ConnectionConfigSchema = z.object({
  configService: z.custom<ConfigService>()
});

export type ConnectionConfigDto = z.infer<typeof ConnectionConfigSchema>;
