import { z } from 'zod';
import { SendEmailDto, SendEmailSchema } from '@common/libs';

export const EmitPasswordResetSchema = SendEmailSchema.extend({
  action: z.literal('password_reset', { message: 'Action must be password_reset' }),

  publishPasswordReset: z.custom<(payload: SendEmailDto) => Promise<SendEmailDto>>()
});

export type EmitPasswordResetDto = z.infer<typeof EmitPasswordResetSchema>;
