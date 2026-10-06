import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { z } from 'zod';

import { BaseTransportSchema } from './base-transport.dto';

export const ResolveTransportSchema = BaseTransportSchema.extend({
  configService: z.custom<ConfigService>(),

  logger: z.custom<Logger>()
});

export type ResolveTransportDto = z.infer<typeof ResolveTransportSchema>;
