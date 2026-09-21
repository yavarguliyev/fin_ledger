import { z } from 'zod';
import { DatabaseAdapter, OutboxRepository } from '@common/libs';

import { RegisterSchema } from '../request/register.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';

export const CreateUserWalletAndLedgerSchema = z.object({
  dto: RegisterSchema,

  passwordHash: z.string({ message: 'Password hash must be a string' }),

  authRepository: z.custom<AuthRepository>(),

  outboxRepository: z.custom<OutboxRepository>(),

  ledgerService: z.custom<LedgerService>(),

  walletService: z.custom<WalletService>(),

  tx: z.custom<DatabaseAdapter>()
});

export type CreateUserWalletAndLedgerDto = z.infer<typeof CreateUserWalletAndLedgerSchema>;
