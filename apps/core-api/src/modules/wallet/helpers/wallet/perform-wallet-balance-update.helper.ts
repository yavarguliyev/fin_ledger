import { ConflictException } from '@nestjs/common';
import { WalletTransactionType } from '@common/libs';

import { PerformWalletBalanceUpdateDto, WalletDto } from '../../dtos/wallet/wallet.dto';

export const performWalletBalanceUpdate = async (options: PerformWalletBalanceUpdateDto): Promise<WalletDto> => {
  const { wallet, amountMinor, tx, balanceWalletTransactionType, walletRepository } = options;

  const delta = balanceWalletTransactionType === WalletTransactionType.DEBIT ? -amountMinor : amountMinor;

  const newAvailable = Number(wallet.availableBalanceMinor) + delta;
  const newReserved = Number(wallet.reservedBalanceMinor);

  const updatedWallet = await walletRepository.updateBalances({
    walletId: wallet.id,
    availableBalanceMinor: newAvailable,
    reservedBalanceMinor: newReserved,
    expectedVersion: wallet.version!,
    adapter: tx!
  });

  if (!updatedWallet) throw new ConflictException('Concurrent modification of wallet balance');
  return updatedWallet;
};
