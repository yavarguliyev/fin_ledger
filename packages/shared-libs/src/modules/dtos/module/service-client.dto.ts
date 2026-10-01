import type { ConfigService } from '@nestjs/config';
import { z } from 'zod';

import { ClientIdSchema } from './client-id.dto';

export const ServiceClientSchema = ClientIdSchema.extend({ configService: z.custom<ConfigService>() });

export type ServiceClientDto = z.infer<typeof ServiceClientSchema>;
