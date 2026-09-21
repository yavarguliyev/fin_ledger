import { z } from 'zod';
import { DigitalWalletType } from '@common/shared-libs';

export const CreateFailedMethodSchema = z.object({
  token: z.string({ message: 'Token must be a string' }).optional(),

  error: z.unknown(),

  walletType: z.enum(DigitalWalletType, { message: 'Invalid digital wallet type' }).optional()
});

export type CreateFailedMethodDto = z.infer<typeof CreateFailedMethodSchema>;
