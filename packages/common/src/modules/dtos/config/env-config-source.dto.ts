import type { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ClientIds } from '@common/shared-libs';

export const EnvConfigSourceSchema = z.object({
  configService: z.custom<ConfigService>(),

  clientId: z.enum(ClientIds).optional()
});

export type EnvConfigSourceDto = z.infer<typeof EnvConfigSourceSchema>;
