import { InternalServerErrorException } from '@nestjs/common';
import { AccountType, APP_CONSTANTS, DomainEventType, UserRoles } from '@common/libs';

import { CreateUserWalletAndLedgerDto } from '../dtos/user-wallet/create-user-wallet-and-ledger.dto';
import { UserWalletAndLedgerDto } from '../dtos/user-wallet/user-wallet-and-ledger.dto';

export const createUserWalletAndLedger = async (options: CreateUserWalletAndLedgerDto): Promise<UserWalletAndLedgerDto> => {
  const { dto, tx, passwordHash, authRepository, outboxRepository, ledgerService, walletService } = options;

  const user = await authRepository.createUser(dto.email, passwordHash, (dto.role as UserRoles) ?? UserRoles.USER, dto.displayName, tx);
  if (!user) throw new InternalServerErrorException('Failed to create user');

  const ledgerAccount = await ledgerService.createAccount(user.id, AccountType.LIABILITY, APP_CONSTANTS.DEFAULT_CURRENCY, tx);
  const wallet = await walletService.createWallet({
    userId: user.id,
    ledgerAccountId: ledgerAccount.id,
    currency: APP_CONSTANTS.DEFAULT_CURRENCY,
    availableBalanceMinor: 0,
    reservedBalanceMinor: 0,
    adapter: tx
  });

  await authRepository.linkWalletAndLedger(user.id, wallet.id, ledgerAccount.id, tx);
  await outboxRepository.createEvent(
    {
      aggregateType: 'User',
      aggregateId: user.id,
      eventType: DomainEventType.USER_REGISTERED,
      payload: {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        walletId: wallet.id,
        ledgerAccountId: ledgerAccount.id
      }
    },
    tx
  );

  return { user, walletId: wallet.id, ledgerAccountId: ledgerAccount.id };
};
