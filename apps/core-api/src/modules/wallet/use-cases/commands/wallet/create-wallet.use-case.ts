import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { WalletDto } from '../../../dtos/wallet/wallet.dto';
import { CreateWalletDto } from '../../../dtos/wallet/wallet-create.dto';
import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
import { WalletTransactionType, DomainEventType, AggregateType, BettingType } from '@common/libs';

@Injectable()
export class CreateWalletUseCase extends WalletBaseUseCase<CreateWalletDto, WalletDto> {
  protected readonly currentWalletTransactionType: WalletTransactionType = WalletTransactionType.NONE;
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly balanceWalletTransactionType = WalletTransactionType.NONE;
  protected readonly requiredToCheckAmountMinor: boolean = false;

  constructor () {
    super();
  }

  async execute (input: CreateWalletDto): Promise<WalletDto> {
    const wallet = await this.walletRepository.createWallet(input);
    if (!wallet) throw new InternalServerErrorException('Failed to create wallet');
    return wallet;
  }
}
