import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { z } from 'zod';

import { BaseSmsTransportSchema } from './base-sms-transport.dto';

export const ResolveSmsTransportSchema = BaseSmsTransportSchema.extend({
  configService: z.custom<ConfigService>(),

  logger: z.custom<Logger>()
});

export type ResolveSmsTransportDto = z.infer<typeof ResolveSmsTransportSchema>;
