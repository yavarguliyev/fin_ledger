import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { SessionService } from '@common/libs';

import { SessionUserSchema } from '../auth/session-user.dto';

export const CreateSessionResponseSchema = z.object({
  dto: SessionUserSchema,

  sessionService: z.custom<SessionService>(),

  configService: z.custom<ConfigService>().optional(),

  isAuth: z.boolean({ message: 'Is auth must be a boolean' }).optional()
});

export type CreateSessionResponseDto = z.infer<typeof CreateSessionResponseSchema>;
