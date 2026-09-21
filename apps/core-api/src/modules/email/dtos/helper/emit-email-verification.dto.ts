import { z } from 'zod';
import { SendEmailDto, SendEmailSchema } from '@common/libs';

export const EmitEmailVerificationSchema = SendEmailSchema.extend({
  action: z.literal('email', { message: 'Action must be email' }),

  publishEmailVerification: z.custom<(payload: SendEmailDto) => Promise<SendEmailDto>>()
});

export type EmitEmailVerificationDto = z.infer<typeof EmitEmailVerificationSchema>;
