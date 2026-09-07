import { InternalServerErrorException } from '@nestjs/common';

import { WalletConversionParams } from '../../../wallet/dtos/conversion/wallet-conversion-params.dto';
import { WalletDto } from '../../../wallet/dtos/wallet/wallet.dto';

export const updateWalletAndLedger = async (options: WalletConversionParams): Promise<WalletDto> => {
  const { source, targetCurrency, targetAmountMinor, tx, walletRepository, ledgerAccountRepository } = options;

  const [updatedWallet, updatedLedgerAccount] = await Promise.all([
    walletRepository.update(source.wallet.id, { currency: targetCurrency, availableBalanceMinor: targetAmountMinor }, undefined, tx),
    ledgerAccountRepository.update(source.ledgerAccount.id, { currency: targetCurrency, balanceMinor: targetAmountMinor }, undefined, tx)
  ]);

  if (!updatedWallet) throw new InternalServerErrorException('Failed to update wallet currency');
  if (!updatedLedgerAccount) throw new InternalServerErrorException('Failed to update ledger account currency');

  return updatedWallet;
};
