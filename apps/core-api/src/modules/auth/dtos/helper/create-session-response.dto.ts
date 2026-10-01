import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { SessionService } from '@common/libs';

import { SessionUserSchema } from '../auth/session-user.dto';

export const CreateSessionResponseSchema = z.object({
  dto: SessionUserSchema,

  sessionService: z.custom<SessionService>(),

  configService: z.custom<ConfigService>().optional(),

  refreshToken: z.string({ message: 'Refresh token must be a string' }).optional()
});

export type CreateSessionResponseDto = z.infer<typeof CreateSessionResponseSchema>;
