import { z } from 'zod';
import type { ConfigService } from '@nestjs/config';
import { ClientIds } from '@common/shared-libs';

import type { DatabaseConfig } from '../../interfaces/database-config.interface';

export const DatabaseAsyncOptionsSchema = z.object({
  clientId: z.enum(ClientIds).optional(),

  inject: z.custom<[typeof ConfigService]>(),

  useFactory: z.custom<(configService: ConfigService) => DatabaseConfig>()
});

export type DatabaseAsyncOptionsDto = z.infer<typeof DatabaseAsyncOptionsSchema>;
