import { z } from 'zod';
import { DigitalWalletType } from '@common/shared-libs';

export const FailedMethodSchema = z.object({
  token: z.string({ message: 'Token must be a string' }).optional(),

  message: z.string({ message: 'Message must be a string' }),

  walletType: z.enum(DigitalWalletType, { message: 'Invalid digital wallet type' }).optional()
});

export type FailedMethodDto = z.infer<typeof FailedMethodSchema>;
