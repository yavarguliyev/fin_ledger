import { z } from 'zod';
import { DigitalWalletType } from '@common/shared-libs';

import { ProviderMethodResultDto } from '../operation/provider-method-result.dto';

export const ExecuteMethodOperationSchema = z.object({
  token: z.string({ message: 'Token must be a string' }).optional(),

  walletType: z.enum(DigitalWalletType, { message: 'Invalid digital wallet type' }).optional(),

  operation: z.custom<() => Promise<ProviderMethodResultDto>>()
});

export type ExecuteMethodOperationDto = z.infer<typeof ExecuteMethodOperationSchema>;
