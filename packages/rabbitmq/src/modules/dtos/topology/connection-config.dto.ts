import type { ConfigService } from '@nestjs/config';
import { z } from 'zod';

export const ConnectionConfigSchema = z.object({ configService: z.custom<ConfigService>() });

export type ConnectionConfigDto = z.infer<typeof ConnectionConfigSchema>;
