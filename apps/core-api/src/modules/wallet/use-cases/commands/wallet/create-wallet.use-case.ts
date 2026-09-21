import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { WalletDto } from '../../../dtos/wallet/wallet.dto';
import { CreateWalletDto } from '../../../dtos/input/create-wallet.dto';
import { WalletBaseUseCase } from '../../base/wallet-base.use-case';
import { DomainEventType, AggregateType, BettingType } from '@common/libs';

@Injectable()
export class CreateWalletUseCase extends WalletBaseUseCase<CreateWalletDto, WalletDto> {
  protected readonly currentDomainEventType: DomainEventType = DomainEventType.NONE;
  protected readonly currentAggregateType: AggregateType = 'None';
  protected readonly currentBettingType: BettingType = 'NONE';
  protected readonly requiredToCheckAmountMinor: boolean = false;

  async execute (input: CreateWalletDto): Promise<WalletDto> {
    const wallet = await this.walletRepository.createWallet(input);
    if (!wallet) throw new InternalServerErrorException('Failed to create wallet');
    return wallet;
  }
}
