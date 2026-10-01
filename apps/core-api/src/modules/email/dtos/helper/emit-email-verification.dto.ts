import { z } from 'zod';
import { SendEmailDto, SendEmailSchema } from '@common/libs';

import { PublishUserEmailDto } from '../step/publish-user-email.dto';

export const EmitEmailVerificationSchema = SendEmailSchema.extend({
  action: z.literal('email', { message: 'Action must be email' }),

  userId: z.string({ message: 'User ID must be a string' }),

  publishEmailVerification: z.custom<(dto: PublishUserEmailDto) => Promise<SendEmailDto>>()
});

export type EmitEmailVerificationDto = z.infer<typeof EmitEmailVerificationSchema>;
