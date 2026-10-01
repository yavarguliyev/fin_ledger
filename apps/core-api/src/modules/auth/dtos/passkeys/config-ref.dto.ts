import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

export const ConfigRefSchema = z.object({ configService: z.custom<ConfigService>() });

export type ConfigRefDto = z.infer<typeof ConfigRefSchema>;
