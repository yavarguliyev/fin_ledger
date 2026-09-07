import { z } from 'zod';
import { DatabaseAdapter, OutboxRepository } from '@common/libs';

import { RegisterDto } from '../register/register.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { LedgerService } from '../../../ledger/ledger.service';
import { WalletService } from '../../../wallet/wallet.service';

export const CreateUserWalletAndLedgerSchema = z.object({
  passwordHash: z.string({ message: 'Password hash must be a string' })
});

export type CreateUserWalletAndLedgerDto = z.infer<typeof CreateUserWalletAndLedgerSchema> & {
  authRepository: AuthRepository;
  outboxRepository: OutboxRepository;
  ledgerService: LedgerService;
  walletService: WalletService;
  dto: RegisterDto;
  tx: DatabaseAdapter;
};
