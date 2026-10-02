import { z } from 'zod';
import type { ConfigService } from '@nestjs/config';

export const OutboxSettingsSourceSchema = z.object({ configService: z.custom<ConfigService>().optional() });

export type OutboxSettingsSourceDto = z.infer<typeof OutboxSettingsSourceSchema>;
