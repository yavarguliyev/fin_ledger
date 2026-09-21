import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AccountType, PostgresService } from '@common/libs';

import { CreateWalletUseCase } from './create-wallet.use-case';
import { WalletRepository } from '../../../repositories/wallet.repository';
import { CurrencyRepository } from '../../../repositories/currency.repository';
import { WalletDto } from '../../../dtos/wallet/wallet.dto';
import { OpenWalletDto } from '../../../dtos/input/open-wallet.dto';
import { LedgerService } from '../../../../ledger/ledger.service';

@Injectable()
export class OpenWalletUseCase {
  constructor (
    private readonly postgresService: PostgresService,
    private readonly walletRepository: WalletRepository,
    private readonly currencyRepository: CurrencyRepository,
    private readonly ledgerService: LedgerService,
    private readonly createWalletUseCase: CreateWalletUseCase
  ) {}

  async execute ({ userId, currency }: OpenWalletDto): Promise<WalletDto> {
    const activeCodes = await this.currencyRepository.findActiveCodes();
    if (!activeCodes.includes(currency)) throw new BadRequestException(`${currency} is not a supported currency`);

    const existing = await this.walletRepository.findByUserAndCurrency({ userId, currency });
    if (existing) throw new ConflictException(`You already have a ${currency} wallet`);

    return this.postgresService.getWriteConnection().transaction({
      callback: async adapter => {
        const ledgerAccount = await this.ledgerService.createAccount({ userId, accountType: AccountType.LIABILITY, currency, adapter });

        return this.createWalletUseCase.execute({
          userId,
          ledgerAccountId: ledgerAccount.id,
          currency,
          availableBalanceMinor: 0,
          reservedBalanceMinor: 0,
          adapter
        });
      }
    });
  }
}
