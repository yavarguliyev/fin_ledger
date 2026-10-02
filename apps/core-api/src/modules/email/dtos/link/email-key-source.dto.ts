import { z } from 'zod';
import type { ConfigService } from '@nestjs/config';

export const EmailKeySourceSchema = z.object({ configService: z.custom<ConfigService>() });

export type EmailKeySourceDto = z.infer<typeof EmailKeySourceSchema>;
