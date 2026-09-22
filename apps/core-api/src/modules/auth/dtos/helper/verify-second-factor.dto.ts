import { z } from 'zod';
import { DatabaseAdapter, TotpService } from '@common/libs';

import { AuthSchema } from '../auth/auth.dto';
import { MfaRecoveryCodeRepository } from '../../repositories/mfa-recovery-code.repository';

export const VerifySecondFactorSchema = z.object({
  user: AuthSchema,

  code: z.string({ message: 'Code must be a string' }),

  totpService: z.custom<TotpService>(),

  mfaRecoveryCodeRepository: z.custom<MfaRecoveryCodeRepository>(),

  adapter: z.custom<DatabaseAdapter>()
});

export type VerifySecondFactorDto = z.infer<typeof VerifySecondFactorSchema>;
