import { z } from 'zod';
import { SendEmailDto, SendEmailSchema } from '@common/libs';

export const EmitEmailVerificationSchema = SendEmailSchema.extend({
  action: z.literal('email', { message: 'Action must be email' }),

  userId: z.string({ message: 'User ID must be a string' }),

  publishEmailVerification: z.custom<(payload: SendEmailDto, userId: string) => Promise<SendEmailDto>>()
});

export type EmitEmailVerificationDto = z.infer<typeof EmitEmailVerificationSchema>;
